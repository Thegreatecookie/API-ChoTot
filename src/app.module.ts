import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './configs/configuration';
import { PostModule } from './modules/posts/post.module';
import { UserModule } from './modules/users/user.module';
import { CategoryModule } from './modules/categories/category.module';
import { AuthModule } from './modules/authentication/auth.module';
@Module({
  imports: [
    MongooseModule.forRoot(config.database_mongo, {
      autoIndex: true,
    }),
    PostModule,
    UserModule,
    CategoryModule,
    AuthModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
