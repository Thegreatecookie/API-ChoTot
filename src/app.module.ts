import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './configs/configuration';
import { PostModule } from './modules/posts/post.module';
import { UserModule } from './modules/users/user.module';
import { CategoryModule } from './modules/categories/category.module';
import { AuthModule } from './modules/authentication/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MailModule } from './mail/mail.module';
import { FollowModule } from './modules/follow/follow.module';
import { NotificationModule } from './modules/notfication/notification.module';
import { TransactionModule } from './modules/transactions/transactions.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.databaseMongo, {
      autoIndex: true,
    }),
    PostModule,
    UserModule,
    CategoryModule,
    AuthModule,
    CategoryModule,
    FollowModule,
    TransactionModule,
    MulterModule.register({
      dest: './uploads',
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = extname(file.originalname);
          const randomName = Array(4)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, `${name}-${randomName}${fileExtName}`);
        },
      }),
    }),
    MailModule,
    NotificationModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
