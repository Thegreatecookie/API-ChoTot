import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {config} from './configs/configuration';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  await app.listen(config.port);
}
bootstrap();
