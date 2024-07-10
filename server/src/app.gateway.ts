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

let inactivityTimeout: NodeJS.Timeout | null = null;
let isOwnerConnected = false;

const containers: Record<string, Sandbox> = {}
const connections: Record<string, number> = {}
const terminals: Record<string, Terminal> = {}

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

    // Change the owner of the project directory to user
    const fixPermissions = async () => {
      await containers[sandboxId].process.startAndWait(
        `sudo chown -R user "${path.join(dirName, "projects", sandboxId)}"`
      );
    };

    // const sandboxFiles = await getSandboxFiles(sandboxId);
  }

  handleDisconnect(client: any) {
    console.log("disconnect")
  }

  afterInit(server: any) {
      
  }
}