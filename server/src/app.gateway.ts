import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    this.logger.log(`Message received: ${payload}`);
    client.emit('message', `Server received: ${payload}`);
  }

  handleConnection(client: any, ...args: any[]) {
      
  }

  handleDisconnect(client: any) {
      
  }

  afterInit(server: any) {
      
  }
}