import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway(5000, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedClients: { [userId: string]: Socket } = {};

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.connectedClients).find(
      (key) => this.connectedClients[key] === client,
    );
    if (userId) {
      delete this.connectedClients[userId];

    }
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const group = await this.chatService.createGroup(data);
    if (group) {
      await client.join(group._id.toString());
    }
  }

  @SubscribeMessage('userConnected')
  handleUserConnected(client: Socket, userId: string) {
    this.connectedClients[userId] = client;

  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    client: Socket,
    payload: {
      postID: string;
      sender: string;
      recipient: string;
      message: string;
    },
  ) {
    await this.chatService.createMessage(payload);
    const recipientSocket = this.connectedClients[payload.recipient];
    if (recipientSocket) {
      recipientSocket.emit('privateMessage', payload);
    }
  }

  @SubscribeMessage('sendMessage')
  async findAll(@MessageBody() data: any) {
    await this.chatService.createMessage(data);

    return this.server.to(data.groupId).emit('receivedMessage', data);
  }

  @SubscribeMessage('receivedEmitNotify')
  async receivedEmitNotify(@MessageBody() data: any) {
    this.server.emit('receivedNotify', data);
  }
}
