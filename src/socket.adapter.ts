import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { config } from './configs/configuration';

export class SocketIoAdapter extends IoAdapter {}
