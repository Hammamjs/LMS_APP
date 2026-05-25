import { JwtPayload } from '@/module/auth';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'notification',
  cors: true,
})
export class NotificationGateWay {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}
  @WebSocketServer() server!: Server;

  async handleConnection(client: Socket): Promise<void> {
    console.log('Incoming socket connection');

    try {
      const token = client.handshake.auth.token as string;

      console.log('TOKEN:', token);

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      });

      console.log('PAYLOAD:', payload);

      const userId = payload.id;

      await client.join(userId);

      console.log(`Joined room: ${userId}`);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        client.emit('error', {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });

        client.disconnect();
        return;
      }
    }
  }

  pushToUser(userId: string, notification: any) {
    this.server.to(userId).emit('notification:new', notification);
  }
}
