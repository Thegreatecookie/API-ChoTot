import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email, pass) {
    const user = await this.usersService.findOne(email);
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      email: user.email,
      phone: user.phone,
      id: user._id,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
