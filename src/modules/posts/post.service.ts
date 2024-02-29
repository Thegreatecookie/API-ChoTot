import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { CreatePostDTO } from 'src/dto/create-post.dto';
import { UpdatePostDTO } from 'src/dto/update-post.dto';
import { PostStatus } from 'src/enums/post-status.enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CategoryService } from '../categories/category.service';
import { UserService } from '../users/user.service';
import { Category } from 'src/schemas/category.schema';
import { Role } from 'src/enums/role.enums';
import { NotificationsService } from '../notfication/notification.service';
import { title } from 'process';
import { SearchDTO } from 'src/dto/search.dto';
@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private notificationService: NotificationsService,
  ) {}

  async create(post: CreatePostDTO) {
    const role = await this.userService.getRole(post.userID);
    const total = await this.postModel.find({
      userID: post.userID,
      status: { $in: ['approved', 'pending'] },
    });
    console.log(post.title)
    const findTitle = await this.postModel.findOne({title:post.title})
    if(findTitle){
      throw new BadRequestException('Tên bài đã tồn tại'); 
    }
    if (role === Role.Normal && total.length < 3) {
      post.address = JSON.parse(post.address);
      post.detailsPost = JSON.parse(post.detailsPost);
      const createdPost = new this.postModel(post);
      return await createdPost.save();
    } else if (role === Role.Partner && total.length < 50) {
      post.address = JSON.parse(post.address);
      post.detailsPost = JSON.parse(post.detailsPost);
      const createdPost = new this.postModel(post);
      return await createdPost.save();
    }
    if (role === Role.Normal) {
      throw new BadRequestException('Bài đăng đã đạt tối đa');
    } else if (role === Role.Partner) {
      throw new BadRequestException('Bài đăng đã đạt tối đa');
    }
  }

  async update(post: UpdatePostDTO) {
    await this.postModel.updateOne(
      { _id: post.postID },
      {
        ...post,
        address: JSON.parse(post.address),
        detailsPost: JSON.parse(post.detailsPost),
        status: PostStatus.pending,
      },
    );
  }
  async findAll() {
    return await this.postModel.find({});
  }
  async findAllByStatus(value: string) {
    return await this.postModel.find({ status: value });
  }
  async findById(id: string) {
    const post = await this.postModel.findById(id);
    const user = await this.userService.findById(post.userID);
    return { post, user };
  }
  async findPending() {
    const data = await this.postModel.find({ status: 'pending' });

    return data;
  }

  async findApproved() {
    const data = await this.postModel.find({ status: 'approved' });

    return data;
  }
  async findStatus(
    id: string,
    query: { status: string; page: number; pageSize: number },
  ) {
    const posts = await this.postModel
      .find({ userID: id, status: query.status })
      .sort({ expiredAt: -1, rejectedAt: -1, updatedAt: -1 })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);
    const totalPost = await this.postModel.countDocuments({
      userID: id,
      status: query.status,
    });
    return { posts, totalPage: Math.ceil(totalPost / query.pageSize) };
  }
  async findStatus1(
    id: string,
    query: { status: string; page: number; pageSize: number },
  ) {
    const posts = await this.postModel
      .find({ userID: id, status: query.status })
      .sort({ expiredAt: 1, rejectedAt: 1, updatedAt: 1 })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize);
    const totalPost = await this.postModel.countDocuments({
      userID: id,
      status: query.status,
    });
    return { posts, totalPage: Math.ceil(totalPost / query.pageSize) };
  }

  async findByUser(userID: string) {
    const data = await this.postModel.find({ userID: userID });
  }

  async findByCategory(query: {
    slug: string;
    page: number;
    pageSize: number;
  }) {
    const category = await this.categoryService.findByname(query.slug);
    const posts = await this.postModel
      .find({ categoryID: category._id, status: 'approved' })
      .sort({ promotedStartAt: -1, approvedAt: -1 })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .lean();
    for (let index = 0; index < posts.length; index++) {
      const element = posts[index];
      const user = await this.userService.findById(element.userID);
      posts[index]['userName'] = user.firstName + ' ' + user.lastName;
      posts[index]['role'] = user.role;
    }
    const totalPost = await this.postModel.countDocuments({
      categoryID: category._id,
      status: 'approved',
    });
    return { posts, totalPage: Math.ceil(totalPost / query.pageSize) };
  }

  async changeStatus(postID: string, status: string, reason: string) {
    const post = await this.postModel.findById(postID);
    const role = await this.userService.getRole(post.userID);
    const total = await this.postModel.find({
      userID: post.userID,
      status: { $in: ['approved', 'pending'] },
    });
    //CHỜ -> HIỂN THỊ (NGƯỜI THƯỜNG)
    if (
      post.status === PostStatus.pending &&
      status === PostStatus.approved &&
      role === Role.Normal
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        {
          status: PostStatus.approved,
          expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
          approvedAt: new Date(),
        },
      );
      await this.notificationService.sendNotification(
        post.userID,
        `Bài ${post.title} đã được duyệt`,
      );
      //CHỜ -> HIỂN THỊ (ĐỐI TÁC)
    } else if (
      post.status === PostStatus.pending &&
      status === PostStatus.approved &&
      role === Role.Partner
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        {
          status: PostStatus.approved,
          expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
          approvedAt: new Date(),
        },
      );
      await this.notificationService.sendNotification(
        post.userID,
        `Bài ${post.title} đã được duyệt`,
      );
    }
    // CHỜ -> ẨN
    else if (
      post.status === PostStatus.pending &&
      status === PostStatus.hidden
    ) {
      await this.postModel.updateOne({ _id: postID }, { status: status });
    }
    // CHỜ -> TỪ CHỐI
    else if (
      post.status === PostStatus.pending &&
      status === PostStatus.rejected
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        {
          status: status,
          approvedAt: null,
          expiredAt: null,
          rejectedAt: Date.now(),
          reason: reason,
        },
      );
      await this.notificationService.sendNotification(
        post.userID,
        `Bài ${post.title} đã bị từ chối`,
      );
    }
    // HiỂN THỊ -> ẨN
    else if (
      post.status === PostStatus.approved &&
      status === PostStatus.hidden
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        {
          status: status,
          approvedAt: null,
          expiredAt: null,
          isPromoted: false,
          promotedStartAt: null,
          promotedEndAt: null,
        },
      );
    }
    // HIỂN THỊ -> CHỜ (KHI SỬA BÀI)
    else if (
      post.status === PostStatus.approved &&
      status === PostStatus.pending
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        { status: status, approvedAt: null, expiredAt: null },
      );
    }
    // TỪ CHỐI -> CHỜ (XIN DUYỆT LẠI)
    else if (
      post.status === PostStatus.rejected &&
      status === PostStatus.pending
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        { status: status, rejectedAt: null },
      );
    } // ẨN-> CHỜ (NGƯỜI THƯỜNG)
    else if (
      post.status === PostStatus.hidden &&
      status === PostStatus.pending &&
      role === Role.Normal &&
      total.length <= 3
    ) {
      await this.postModel.updateOne({ _id: postID }, { status: status });
    }
    // ẨN-> CHỜ (ĐỐI TÁC)
    else if (
      post.status === PostStatus.hidden &&
      status === PostStatus.pending &&
      role === Role.Partner &&
      total.length <= 50
    ) {
      await this.postModel.updateOne({ _id: postID }, { status: status });
    }
    //HẾT HẠN -> CHỜ
    else if (
      post.status === PostStatus.expired &&
      status === PostStatus.pending
    ) {
      await this.postModel.updateOne(
        { _id: postID },
        { status: status, expiredAt: null },
      );
    } else {
      throw new BadRequestException('Lỗi');
    }
  }

  async countByStatus(id: string) {
    const data = await Promise.all([
      this.postModel.countDocuments({
        userID: id,
        status: 'approved',
      }),
      this.postModel.countDocuments({
        userID: id,
        status: 'pending',
      }),
      this.postModel.countDocuments({
        userID: id,
        status: 'hidden',
      }),
      this.postModel.countDocuments({
        userID: id,
        status: 'expired',
      }),
      this.postModel.countDocuments({
        userID: id,
        status: 'rejected',
      }),
    ]);
    return data;
  }

  async countByStatus1(id: string) {
    const data = await Promise.all([
      this.postModel.countDocuments({
        userID: id,
        status: 'approved',
      }),
    ]);
    return data;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkExpiredTime() {
    const data = await this.postModel.find({
      expiredAt: { $lt: new Date() },
      status: 'approved',
    });
    if (!data.length) return null;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await this.postModel.updateOne(
        { _id: element._id },
        {
          status: 'expired',
          approvedAt: null,
        },
      );
    }
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkHiddenTime() {
    const data = await this.postModel.find({
      updatedAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      status: 'hidden',
    });
    if (!data.length) return null;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await this.postModel.deleteOne({ _id: element._id });
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async rotatePromotedPosts() {
    const newDate = new Date();
    const posts = await this.postModel
      .find({
        isPromoted: true,
        promotedEndAt: { $gte: newDate },
      })
      .sort({ promotedStartAt: 1 })
      .limit(5);
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      await this.postModel.updateOne(
        { _id: post._id },
        { promotedStartAt: newDate },
      );
    }
  }

  async deleteWithCategory(id: string) {
    const data = await this.postModel.find({ categoryID: id });
    if (!data.length) return null;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await this.postModel.deleteOne({ _id: element._id });
    }
  }
  // async approve(postID: {string) {
  //   await this.postModel.updateOne(
  //     { _id: postID },
  //     {
  //       status: PostStatus.approved,
  //       expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  //       approvedAt: new Date(),
  //     },
  //   );
  // }

  // async timeout(postID: string) {
  //   await this.postModel.updateOne(
  //     { _id: postID },
  //     { status: PostStatus.expired },
  //   );
  // }

  // async denied(postID: string) {
  //   await this.postModel.updateOne(
  //     { _id: postID },
  //     { status: PostStatus.rejected },
  //   );
  // }

  async search(query: SearchDTO) {
    const filter: any = {
      status: 'approved',
    };

    if (query.min) {
      filter.price = { $gte: query.min };
    }
    if (query.max) {
      if (filter.price) {
        filter.price.$lte = query.max;
      } else {
        filter.price = { $lte: query.max };
      }
    }
    if (query.categoryID) {
      filter.categoryID = query.categoryID;
    }
    const data = await this.postModel
      .find({ ...filter, title: { $regex: `${query.name}`, $options: 'i' } })
      .sort({ promotedStartAt: -1, approvedAt: -1 })
      .limit(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .lean();
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const user = await this.userService.findById(element.userID);
      data[index]['userName'] = user.firstName + ' ' + user.lastName;
      data[index]['role'] = user.role;
    }
    // const posts = await this.postModel
    //   .find({
    //     $and: [
    //       { $text: { $search: `\"${query.name.toLowerCase()}\"` } },
    //       filter,
    //     ],
    //   })
    //   .limit(query.pageSize)
    //   .skip((query.page - 1) * query.pageSize)
    //   .lean();
    const totalPost = await this.postModel.countDocuments({
      ...filter,
      title: { $regex: `${query.name}`, $options: 'i' },
    });
    // const users = await this.userService.search(query.name)
    // const userIDs = users.map(user=>user._id)
    // const findposts = await this.postModel.find({userID:{$in:userIDs}}).lean()
    // const mergedArray = [...new Set([...posts, ...data])];
    return {
      posts: data,
      totalPage: Math.ceil(totalPost / query.pageSize),
    };
  }
  async hiddenAll(id: string) {
    return await this.postModel.updateMany(
      { userID: id },
      { status: 'hidden' },
    );
  }
  async promote(id: string, date: number, value: number) {
    const dateNow = Date.now();
    // const post = await this.postModel.findById(id).select('expiredAt');
    const post = await this.postModel.findById(id);
    const user = await this.userService.findById(post.userID);
    if (user.balance >= value && post.promotedEndAt !== null) {
      await this.userService.chargeFee(user.id, value);
      await this.postModel.updateOne(
        { _id: id },
        {
          $set: {
            isPromoted: true,
            promotedStartAt: new Date(dateNow),
            promotedEndAt: new Date(
              new Date(post?.promotedEndAt).getTime() + date,
            ),
            expiredAt: new Date(new Date(post?.expiredAt).getTime() + date),
          },
        },
      );
    } else if (user.balance >= value) {
      await this.userService.chargeFee(user.id, value);
      await this.postModel.updateOne(
        { _id: id },
        {
          $set: {
            isPromoted: true,
            promotedStartAt: new Date(dateNow),
            promotedEndAt: new Date(dateNow + date),
            expiredAt: new Date(new Date(post?.expiredAt).getTime() + date),
          },
        },
      );
    }
  }
  async removePromote(id: string, date: number, value: number) {
    const dateNow = Date.now();
    return await this.postModel.findByIdAndUpdate(id, {
      isPromoted: false,
      promotedStartAt: null,
      promotedEndAt: null,
    });
  }
}
