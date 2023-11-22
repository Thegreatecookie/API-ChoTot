import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { CreatePostDTO } from 'src/dto/create-post.dto';
import { UpdatePostDTO } from 'src/dto/update-post.dto';
import { PostStatus } from 'src/enums/post-status.enums';
@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(post: CreatePostDTO) {
    const createdPost = new this.postModel(post);
    return await createdPost.save();
  }

  async update(post: UpdatePostDTO) {
    this.postModel.updateOne(
      { _id: post.postID },
      { ...post, status: PostStatus.pending },
    );
  }

  async findOne(id: string) {
    return await this.postModel.findOne({ id });
  }

  async hide(postID: string) {
    await this.postModel.updateOne(
      { _id: postID },
      { status: PostStatus.hide },
    );
  }

  async approve(postID: string) {
    await this.postModel.updateOne(
      { _id: postID },
      { status: PostStatus.approved },
    );
  }

  async timeout(postID: string) {
    await this.postModel.updateOne(
      { _id: postID },
      { status: PostStatus.timeout },
    );
  }

  async denied(postID: string) {
    await this.postModel.updateOne(
      { _id: postID },
      { status: PostStatus.denied },
    );
  }

  async getbyCategoryID(categoryID: string) {
    return this.postModel.findById(categoryID);
  }

  async getbyUserID(userID: string) {
    return this.postModel.findById(userID);
  }
  
}
