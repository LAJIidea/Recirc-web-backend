import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { MinioService } from "./minio/minio.service";
import { date, z } from "zod";
import { UserService } from "./user/user.service";
import { SandboxService } from "./sandbox/sandbox.service";
import { Sandbox, Terminal, FilesystemManager } from "e2b";
import { LockManager } from "./utils/utils";
import path from "path";
import { ComposeFilesData, MinIOFiles } from "./minio/types";
import { MAX_BODY_SIZE, saveFileRL } from "./config/ratelimit";

let inactivityTimeout: NodeJS.Timeout | null = null;
let isOwnerConnected = false;

const containers: Record<string, Sandbox> = {}
const connections: Record<string, number> = {}
const terminals: Record<string, Terminal> = {}
const composes: Record<string, ComposeFilesData> = {}

const lockManager = new LockManager();

const dirName = "/home/user";

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppGateway');

  @WebSocketServer() server: Server;

  constructor(
    private readonly minioService: MinioService,
    private readonly userService: UserService,
    private readonly sandboxService: SandboxService
  ) {}

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    this.logger.log(`Message received: ${payload}`);
    client.emit('message', `Server received: ${payload}`);
  }

  @SubscribeMessage('uploadFile')
  async handlerUploadFile(client: Socket, payload: { bucketName: string; fileName: string, filePath: string}) {
    const { bucketName, fileName, filePath } = payload;
    await this.minioService.uploadFile(bucketName, fileName, filePath);
    client.emit('message', 'File uploaded successfully');
  }

  @SubscribeMessage('downloadFile')
  async handleDownloadFile(client: Socket, payload: { bucketName: string; fileName: string }) {
    const { bucketName, fileName } = payload;
    const downloadPath = `./downloads/${fileName}`;
    await this.minioService.downloadFile(bucketName, fileName, downloadPath);
    client.emit('downloadFileResponse', { message: 'File downloaded successfully', path: downloadPath });
  }

  @SubscribeMessage('getFile')
  handlerGetFile(client: Socket, fileId: string): string {
    console.log(fileId);
    try {
      const data = client.data as {
        userId: string;
        sandboxId: string;
        isOwner: boolean;
      }
      const file = composes[data.sandboxId].fileData.find((f) => f.id === fileId);
      if (!file) return "null";

      return file.data;
    } catch (e: any) {
      console.error("Error getting file: ", e);
      client.emit("error", `Error: get file. ${e.message ?? e}`); 
    }
  }

  async handlerGetFolder(client: Socket, folderId: string) : Promise<string[]> {
    try {
      const files = await this.minioService.getFolder(folderId)
      return files;
    } catch (e: any) {
      console.error("Error getting folder: ", e);
      client.emit("error", `Error: get folder. ${e.message ?? e}`)
    }
  }

  // todo: send diffs + debounce for efficiency
  async handerSaveFile(client: Socket, fileId: string, body: string) {
    if (!fileId) return;

    try {
      const data = client.data as {
        userId: string;
        sandboxId: string;
        isOwner: boolean;
      }
      if (Buffer.byteLength(body, "utf-8") > MAX_BODY_SIZE) {
        this.server.emit(
          "error",
          "Error: file size too large. Please reduce the file size."
        );
        return;
      }
      try {
        await saveFileRL.consume(data.userId, 1);
      } catch (e) {
        
      }
    } catch (e) {
      
    }
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const handshakeSchema = z.object({
      userId: z.string(),
      sandboxId: z.string(),
      EIO: z.string(),
      transport: z.string()
    });

    const q = client.handshake.query;
    const parseQuery = handshakeSchema.safeParse(q);

    if (!parseQuery.success) {
      client.disconnect(true)
      console.log("error")
    }

    const { sandboxId, userId } = parseQuery.data;
    const user = await this.userService.findOne(userId)
    if (!user) {
      console.log("error")
    }

    const sandbox = user.sandboxes.find((s) => s.id === sandboxId);
    const sharedSandboxes = user.usersToSandboxes.find(
      (uts) => uts.sandboxId === sandboxId
    );

    if (!sandbox && !sharedSandboxes) {
      console.log("error")
    }

    client.data = {
      userId,
      sandboxId,
      isOnwer: sandbox !== undefined
    }

    let isOnwer = sandbox !== undefined;
    if (isOnwer) {
      isOwnerConnected = true;
      connections[sandboxId] = (connections[sandboxId] ?? 0) + 1; 
    } else {
      if (!isOwnerConnected) {
        client.emit("disableAccess", "The sandbox owner is not connected");
        client.disconnect(true)
      }
    }

    await lockManager.acquireLock(sandboxId, async () => {
      try {
        if (!containers[sandboxId]) {
          containers[sandboxId] = await Sandbox.create();
          console.log("Create container ", sandboxId);
          this.server.emit(
            "previewURL", 
            "https://" + containers[sandboxId].getHostname(5173)
          );
        }
      } catch (e: any) {
        console.error(`Error creating container ${sandboxId}:`, e);
        client.emit("error", `Error: container creation. ${e.message ?? e}`);
      }
    });

    const sandboxFiles = await this.minioService.getSandboxFiles(sandboxId);
    sandboxFiles.fileData.forEach(async (file) => {
      const filePath = path.join(dirName, file.id);
      await containers[sandboxId].filesystem.makeDir(
        path.dirname(filePath)
      );
      await containers[sandboxId].filesystem.write(filePath, file.data);
    });
    this.fixPermissions(sandboxId);

    composes[sandboxId] = sandboxFiles;
    client.emit("loaded", sandboxFiles.files);
  }

  handleDisconnect(client: any) {
    console.log("disconnect")
  }

  afterInit(server: any) {
      
  }

  // Change the owner of the project directory to user
  fixPermissions = async (sandboxId) => {
    await containers[sandboxId].process.startAndWait(
      `sudo chown -R user "${path.join(dirName, "projects", sandboxId)}"`
    );
  };
}