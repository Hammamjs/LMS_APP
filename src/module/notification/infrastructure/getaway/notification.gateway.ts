import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'notification', cors: true })
export class NotificationGateWay {
  @WebSocketServer() server!: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) await client.join(userId);
  }

  pushToUser(userId: string, notification: any) {
    this.server.to(userId).emit('new-message', notification);
  }
}
