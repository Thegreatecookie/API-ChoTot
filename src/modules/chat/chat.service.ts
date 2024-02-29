import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../users/user.service';
import { Chat } from 'src/schemas/chat.schema';
import { PostService } from '../posts/post.service';
import { Group } from 'src/schemas/group.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private postService: PostService,
    private userService: UserService,
  ) {}

  async createMessage(data) {
    const chat = await this.chatModel.create(data);
    return chat;
  }



  async getAllChat(userID: string) {
    const chats = await this.chatModel.aggregate([
      { $match: { $or: [{ sender: userID }, { recipient: userID }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { id: '$id', postID: '$postID' },
          message: { $first: '$message' },
        },
      },
      {
        $project: { _id: 0, id: '$_id.id', postID: '$_id.postID', message: 1 },
      },
    ]);
    await Promise.all(
      chats?.map(async (chat) => {
        const id = chat.id.split('-');
        if (id[0] === userID) {
          chat.otherID = id[1];
        } else {
          chat.otherID = id[0];
        }
        const user = await this.userService.findById(chat.otherID);
        const { post } = await this.postService.findById(chat.postID);
        chat.otherUserName = user.firstName + ' ' + user.lastName;
        chat.postTitle = post.title;
        return chat;
      }),
    );
    return chats;
  }
  async findOneChat(sender: string, recipient: string, postID: string) {
    const data = this.chatModel.findOne({ sender, postID, recipient });
    if (data) {
      return true;
    } else {
      return false;
    }
  }

  async createGroup(createChatDto: any) {
    if (createChatDto.buyerId == createChatDto.sellerId) {
      return null;
    }
    const group = await this.groupModel.findOne({
      $and: [
        {
          buyerId: createChatDto.buyerId,
        },
        {
          sellerId: createChatDto.sellerId,
        },
      ],
    });
    if (group) {
      return group;
    }
    return await this.groupModel.create(createChatDto);
  }

  async getAllRoom(id: string) {
    const rooms = await this.groupModel
      .find({
        $or: [
          {
            buyerId: id,
          },
          {
            sellerId: id,
          },
        ],
      })
      .populate('buyerId')
      .populate('sellerId')
      .exec();

    return rooms;
  }

  async getRoom(id: string) {
    const room = await this.chatModel
      .find({
        groupId: id,
      })
      .populate('userId')
      .exec();

    return room;
  }
  async getAllMessage(id: string) {
    const room = await this.chatModel
      .find({
        groupId: id,
      })
      .exec();

    return room;
  }
}
