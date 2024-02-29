import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDTO } from 'src/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Public, config } from 'src/configs/configuration';
import { UpdateUserDTO } from 'src/dto/update-user.dto';
import { ChangePasswordDTO } from 'src/dto/update-password.dto';
import { CodeVerify } from 'src/schemas/codeVerify.schema';
import { MailService } from 'src/mail/mail.service';
import { Role } from 'src/enums/role.enums';
import { NotificationsService } from '../notfication/notification.service';
import { PostService } from '../posts/post.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CodeVerify.name) private codeVerifyModel: Model<CodeVerify>,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    private mailService: MailService,
    private notificationService: NotificationsService,
  ) {}

  async create(user: CreateUserDTO) {
    const hash = await bcrypt.hash(user.password, config.saltOrRounds);
    user.password = hash;
    const createdUser = new this.userModel(user);
    const phone = await this.userModel.findOne({ phone: user.phone });
    const email = await this.userModel.findOne({ email: user.email });
    const CCID = await this.userModel.findOne({ CCID: user.CCID });
    if (phone) {
      throw new BadRequestException('Số điện thoại đã tồn tại');
    }
    if (email) {
      throw new BadRequestException('Email đã tồn tại');
    }
    if (CCID) {
      throw new BadRequestException('Căn cước công dân đã tồn tại');
    }
    if (new Date(user.dateOfBirth).getTime() > Date.now()) {
      throw new BadRequestException(
        'Thời gian sinh không được vượt quá hiện tại',
      );
    }
    const userCreated = await createdUser.save();
    const createToken = Math.floor(1000 + Math.random() * 9000).toString();
    await this.codeVerifyModel.create({
      userID: userCreated._id,
      token: createToken,
    });
    await this.mailService.sendUserConfirmation(userCreated.email, createToken);
    return userCreated;
  }
  

  async findOne(email: string) {
    return await this.userModel.findOne({ email });
  }
  async findAll() {
    return await this.userModel.find({
      role: { $in: [Role.Normal, Role.Partner] },
    });
  }

  async findAllUser(query: { page: number; pageSize: number }) {
    const users = await this.userModel
      .find({
        role: { $in: [Role.Normal, Role.Partner] },
      })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);
    const totalUser = await this.userModel.countDocuments({
      role: { $in: [Role.Normal, Role.Partner] },
    });
    return {
      users,

      totalPage: Math.ceil(totalUser / query.pageSize),
    };
  }

  async findAllStaff(query: { page: number; pageSize: number }) {
    const staffs = await this.userModel
      .find({
        role: Role.Staff,
      })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);
    const totalStaff = await this.userModel.countDocuments({
      role: Role.Staff,
    });
    return {
      staffs,
      totalPage: Math.ceil(totalStaff / query.pageSize),
    };
  }

  async findById(id: string) {
    return await this.userModel.findById(id);
  }

  async update(user: UpdateUserDTO, email: string) {
    return await this.userModel.updateOne({ email: email }, user);
  }

  async changePassword(data: ChangePasswordDTO, email: string) {
    const user = await this.userModel.findOne({ email });
    const isMatch = await bcrypt.compare(data.oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    } else if (data.oldPass === data.newPass) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng mật khẩu cũ',
      );
    }
    const hash = await bcrypt.hash(data.newPass, config.saltOrRounds);
    return await this.userModel.updateOne({ email }, { password: hash });
  }

  async delete(email: string) {
    return await this.userModel.deleteOne({ email });
  }

  async changeRole(role: string, email: string) {
    return await this.userModel.updateOne({ email }, { role });
  }

  async getRole(id: string) {
    const user = await this.userModel.findById(id);
    return user.role;
  }

  async changeStatus(status: boolean, id: string) {
    if (status === false) {
      await this.notificationService.sendNotification(
        id,
        'Tài khoản đã được mở khóa',
      );
    } else {
      await this.postService.hiddenAll(id);
      await this.notificationService.sendNotification(
        id,
        'Tài khoản đã bị khóa',
      );
    }
    await this.userModel.updateOne({ _id: id }, { active: !status });
  }
  async search(name: string) {
    const users = await this.userModel
      .find({ $text: { $search: name.toLowerCase() } })
      .lean();
    return users;
  }

  async transaction(userID: string, value: number) {
    if (!value) {
      throw new BadRequestException('Vui lòng chọn gói');
    }
    await this.userModel.updateOne(
      { _id: userID },
      { $inc: { balance: value } },
    );
  }

  async changetoPartner(userID: string, body: { time: number; value: number }) {
    if (!body.time && !body.value) {
      throw new BadRequestException('Vui lòng chọn gói');
    }
    const user = await this.findById(userID);
    const date = new Date(
      new Date(user.partnerExpiredAt).getTime() + body.time,
    );
    if (user.balance < body.value) {
      throw new BadRequestException(
        'Tài khoản không đủ tiền! Vui lòng nạp thêm',
      );
    }
    return await this.userModel.updateOne(
      { _id: userID },
      {
        role: Role.Partner,
        $inc: { balance: -body.value },
        partnerExpiredAt: date,
      },
    );
  }
  async chargeFee(userID: string, value: number) {
    await this.userModel.updateOne(
      { _id: userID },
      { $inc: { balance: -value } },
    );
  }
}
