import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notification.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({ namespace: 'notification', transports: ['websocket'] })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(private readonly notificationsService: NotificationsService) {
    this.server = new Server({ path: '/' });
  }

  handleConnection(client: Socket, ...args: any[]) {
    const userId = client?.handshake?.query?.userId;


    //  this.notificationsService.addClient(userId, client);
  }

  handleDisconnect(client: Socket) {


    // const userId = client.handshake.query.userId;
    // this.notificationsService.removeClient(userId);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: string }) {

    const { userId } = payload;
    this.notificationsService.addClient(userId, client);
  }
}
