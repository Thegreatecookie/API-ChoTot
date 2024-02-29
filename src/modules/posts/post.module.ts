import { Module, forwardRef } from '@nestjs/common';
import { PostsController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { CategoryModule } from '../categories/category.module';
import { UserModule } from '../users/user.module';
import { NotificationModule } from '../notfication/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    forwardRef(() => CategoryModule),
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
    forwardRef(() => UserModule),
    ScheduleModule.forRoot(),
    NotificationModule
  ],
  controllers: [PostsController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
