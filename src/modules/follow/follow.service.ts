import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFollowDTO } from 'src/dto/create-follow.dto';
import { Follow } from 'src/schemas/follow.schema';
import { UserService } from '../users/user.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private FollowModel: Model<Follow>,
    private userService: UserService,
  ) {}

  async create(follow: CreateFollowDTO) {
    const createdFollow = new this.FollowModel(follow);
    return await createdFollow.save();
  }
  async delete(userID: string, followedID: string) {

    const follow = await this.FollowModel.findOne({
      userID: userID,
      followedID: followedID,
    });

    if (follow) {
      return await this.FollowModel.deleteOne({ _id: follow._id });
    }
  }
  async getFollow(userId: string) {
    const data = await this.FollowModel.find({ userID: userId });
    const length = data.length;
    const result = await Promise.all(
      data.map(async (item) => {
        const users = await this.userService.findById(item.followedID);
        return {
          id: users._id,
          firstName: users.firstName,
          lastName: users.lastName,
        };
      }),
    );
    return { length, result };
  }
  async getFollowed(userId: string) {
    const data = await this.FollowModel.find({ followedID: userId });
    const length = data.length;
    const result = await Promise.all(
      data.map(async (item) => {
        const users = await this.userService.findById(item.userID);
        return {
          id: users._id,
          firstName: users.firstName,
          lastName: users.lastName,
        };
      }),
    );
    return { length, result };
  }
  async getByUserAndFollow(userID: string, followedID: string) {
    return await this.FollowModel.findOne({
      userID: userID,
      followedID: followedID,
    });
  }
  async checkFollow(userId: string, followedId: string) {
    const data = await this.FollowModel.findOne({
      userID: userId,
      followedID: followedId,
    });

    if (data) {
      return true;
    } else {
      return false;
    }
  }

  async total(id: string) {
    const data = await Promise.all([
      this.FollowModel.countDocuments({ userID: id }),
      this.FollowModel.countDocuments({ followedID: id }),
    ]);
    return data;
  }
}
