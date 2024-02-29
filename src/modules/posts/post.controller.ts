import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDTO } from 'src/dto/create-post.dto';
import { Role } from 'src/enums/role.enums';
import { Public, Roles } from 'src/configs/configuration';
import { UpdatePostDTO } from 'src/dto/update-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { AuthGuard } from '../authentication/auth.guard';
import { SearchDTO } from 'src/dto/search.dto';
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('files[]'))
  async create(
    @Request() req,
    @Body() createPost: CreatePostDTO,
    @UploadedFiles() files,
  ) {
    createPost.userID = req.user.id;
    const filePaths = files.map((file) => file.path.replace(/^uploads\\/, ''));
    createPost.image_path = filePaths;
    return await this.postService.create(createPost);
  }

  @Put('update')
  @UseInterceptors(FilesInterceptor('files[]'))
  async update(
    @Request() req,
    @Body() updatePost: UpdatePostDTO,
    @UploadedFiles() files,
  ) {
    updatePost.userID = req.user.id;
    const filePaths = files.map((file) => file.path.replace(/^uploads\\/, ''));
    updatePost.image_path = filePaths;
    return await this.postService.update(updatePost);
  }

  @Get()
  async getAll() {
    return await this.postService.findAll();
  }

  @Get('total')
  async getTotal(@Req() req) {
    const userID = req.user.id;
    return await this.postService.countByStatus(userID);
  }

  @Public()
  @Get('total1')
  async getTotal1(@Query('userID') userID: string) {
    return await this.postService.countByStatus1(userID);
  }

  @Public()
  @Get('id')
  async findOne(@Query('postID') postID: string) {

    return await this.postService.findById(postID);
  }

  @Public()
  @Get('category')
  async getByCategory(
    @Query('slug') slug: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.postService.findByCategory({ slug, page, pageSize });
  }

  @Get('user')
  async getByUser(@Query('userID') userID: string) {

    return await this.postService.findByUser(userID);
  }

  @Get('find-status')
  async getByStatus(
    @Query('status') status: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,

    @Req() req,
  ) {
    const userID = req.user.id;
    return await this.postService.findStatus(userID, {
      status,
      page,
      pageSize,
    });
  }
  @Public()
  @Get('find-status1')
  async getByStatus1(
    @Query('status') status: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('userID') userID: string,
  ) {
    return await this.postService.findStatus1(userID, {
      status,
      page,
      pageSize,
    });
  }

  @Get('staff/status')
  async getAllByStatus(@Query('status') value: string) {
    return await this.postService.findAllByStatus(value);
  }
  // @Get('admin/status/')
  // async getAllByStatus(@Query('status') value: string) {
  //   return await this.postService.findAllByStatus(value);
  // }
  @Put('change-status')
  async changeStatus(@Body() body: UpdatePostDTO) {

    return await this.postService.changeStatus(
      body.postID,
      body.status,
      body?.reason,
    );
  }

  @Get('pending')
  async getPending() {
    return await this.postService.findPending();
  }

  @Get('approved')
  async getApproved() {
    return await this.postService.findApproved();
  }

  @Public()
  @Get('search')
  async getBySearch(@Query() query: SearchDTO) {
    return await this.postService.search(query);
  }

  @Post('promote')
  async promote(@Body() body) {
    return await this.postService.promote(body.id,body.date,body.value);
  }
}
