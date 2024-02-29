import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CodeVerify, CodeVerifySchema } from 'src/schemas/codeVerify.schema';
import { MailModule } from 'src/mail/mail.module';
import { NotificationModule } from '../notfication/notification.module';
import { PostModule } from '../posts/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CodeVerify.name, schema: CodeVerifySchema },
    ]),
    forwardRef(() => PostModule),
    MailModule,
    NotificationModule,
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
