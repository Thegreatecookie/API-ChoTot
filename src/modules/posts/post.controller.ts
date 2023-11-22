import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDTO } from 'src/dto/create-post.dto';
import { Role } from 'src/enums/role.enums';
import { Roles } from 'src/configs/configuration';
import { UpdatePostDTO } from 'src/dto/update-post.dto';
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  async create(@Request() req, @Body() createPost: CreatePostDTO) {
    createPost.userID = req.user.id;
    return await this.postService.create(createPost);
  }

  @Put('update')
  async update(@Body() updatePost: UpdatePostDTO) {
    return await this.postService.update(updatePost);
  }

  @Get()
  async getByUser(@Request() req) {
    return await this.postService.findOne(req.user.id);
  }

  @Get()
  async getByCategory(@Query() query: { categoryID: string }) {
    return await this.postService.getbyCategoryID(query.categoryID);
  }

  @Put('hide')
  async hide(@Body() body: { postID: string }) {
    return await this.postService.hide(body.postID);
  }

  @Put('approve')
  async approve(@Body() body: { postID: string }) {
    return await this.postService.approve(body.postID);
  }

  @Put('timeout')
  async timeout(@Body() body: { postID: string }) {
    return await this.postService.timeout(body.postID);
  }

  @Put('denied')
  async denied(@Body() body: { postID: string }) {
    return await this.postService.denied(body.postID);
  }
}
