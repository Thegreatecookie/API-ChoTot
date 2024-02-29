import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { CodeVerify } from 'src/schemas/codeVerify.schema';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Role } from 'src/enums/role.enums';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectModel(CodeVerify.name) private codeVerifyModel: Model<CodeVerify>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async signIn(email, pass) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    const isMatch = await bcrypt.compare(pass, user?.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu không đúng');
    }
    if (user.emailVerified === 'Chưa xác thực') {
      throw new BadRequestException('Vui lòng xác thực tài khoản qua email');
    }
    if (user.active === false) {
      throw new BadRequestException(
        'Tài khoản bị khóa! Vui lòng liên hệ chăm sóc khách hàng',
      );
    }
    const payload = {
      email: user.email,
      phone: user.phone,
      id: user._id,
      role: user.role,
      lastName: user.lastName,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async adminSignIn(email, pass) {
    const user = await this.usersService.findOne(email);

    if (user.active === false) {
      throw new BadRequestException(
        'Tài khoản bị khóa! Vui lòng liên hệ chăm sóc khách hàng',
      );
    }
    if (user.role !== Role.Admin && user.role !== Role.Staff) {
      throw new BadRequestException('Tài khoản không đủ quyền hạng');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu không đúng');
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

  async checkToken(token: string) {
    const verify_token = await this.codeVerifyModel.findOne({ token });
    if (verify_token) {
      await this.userModel.updateOne(
        { _id: verify_token.userID },
        { emailVerified: 'Đã xác thực' },
      );
      await this.codeVerifyModel.deleteOne({ token });
    }
    return 'Xác thực thành công';
  }
}
