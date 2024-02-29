import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './configs/configuration';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as http from 'http';
import { WsAdapter } from '@nestjs/platform-ws';
import { ValidationPipe } from '@nestjs/common';
import { SocketIoAdapter } from './socket.adapter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // app.enableCors({
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  //   origin: ['http://localhost:3000'],
  //   credentials: true,
  //   allowedHeaders: ['Access-Control-Allow-Origin'],
  // });
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.useGlobalPipes(new ValidationPipe({ validateCustomDecorators: true }));
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  await app.listen(config.port);
}
bootstrap();
