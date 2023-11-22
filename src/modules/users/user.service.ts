import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDTO } from 'src/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { config } from 'src/configs/configuration';
import { UpdateUserDTO } from 'src/dto/update-user.dto';
import { ChangePasswordDTO } from 'src/dto/update-password.dto';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: CreateUserDTO) {
    const hash = await bcrypt.hash(user.password, config.saltOrRounds);
    user.password = hash;
    const createdUser = new this.userModel(user);
    if (new Date(user.dateOfBirth).getTime() > Date.now()) {
      throw 'Thời gian sinh không được vượt quá hiện tại';
    }
    return createdUser.save();
  }

  async findOne(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(user: UpdateUserDTO, email: string) {
    return await this.userModel.updateOne({ email: email }, user);
  }

  async changePassword(data: ChangePasswordDTO, email: string) {
    const user = await this.userModel.findOne({ email });
    const isMatch = await bcrypt.compare(data.OldPass, user.password);
    if (!isMatch) {
      throw 'Mật khẩu hiện tại không đúng';
    }
    const hash = await bcrypt.hash(data.NewPass, config.saltOrRounds);
    return await this.userModel.updateOne({ email }, { password: hash });
  }

  async delete(email: string) {
    return await this.userModel.deleteOne({ email });
  }

  async changeRole(role: string, email: string) {
    return await this.userModel.updateOne({ email }, { role });
  }
}
