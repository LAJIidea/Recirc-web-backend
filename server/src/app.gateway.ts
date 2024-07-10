import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { MinioService } from "./minio/minio.service";

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly minioService: MinioService) {}

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

  handleConnection(client: any, ...args: any[]) {
      
  }

  handleDisconnect(client: any) {
    console.log("disconnect")
  }

  afterInit(server: any) {
      
  }
}