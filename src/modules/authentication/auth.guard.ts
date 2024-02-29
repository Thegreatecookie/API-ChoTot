import {
  BadRequestException,
  CanActivate,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/configs/configuration';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService,private reflector:Reflector,private userService:UserService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(config.isPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    let user 
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: config.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
      user = await this.userService.findById(payload.id)
      
    } catch {
      throw new UnauthorizedException();
    }
    if(!user.active){
      throw new BadRequestException('Tài khoản bị khóa! Vui lòng liên hệ chăm sóc khách hàng')
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
