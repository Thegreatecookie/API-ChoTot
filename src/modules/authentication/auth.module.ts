import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { config } from 'src/configs/configuration';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CodeVerify, CodeVerifySchema } from 'src/schemas/codeVerify.schema';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: config.secret,
      signOptions: { expiresIn: '365d' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },{ name: CodeVerify.name, schema: CodeVerifySchema }])
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
