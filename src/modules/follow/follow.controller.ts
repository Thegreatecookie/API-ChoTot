import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDTO } from 'src/dto/create-follow.dto';

@Controller('followes')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('create')
  async create(@Request() req, @Body() createFollow: CreateFollowDTO) {
    createFollow.userID = req.user.id;
    return await this.followService.create(createFollow);
  }

  @Delete('delete')
  async delete(@Request() req, @Query('followedID') followedID: string) {
    const userID = req.user.id;
    return await this.followService.delete(userID, followedID);
  }

  @Get('follow')
  async follow(@Request() req) {
    const userID = req.user.id;
    return await this.followService.getFollow(userID);
  }

  @Get('check-follow')
  async checkfollow(@Request() req, @Query('id') id: string) {
    const userID = req.user.id;
    return await this.followService.checkFollow(userID, id);
  }
  @Get('followed')
  async followed(@Request() req) {
    const userID = req.user.id;
    return await this.followService.getFollowed(userID);
  }

  @Get('total')
  async total(@Request() req) {
    const id = req.user.id;
    return await this.followService.total(id);
  }
  @Get('both')
  async both(@Request() req, @Body() body) {
    const userID = req.user.id;
    return await this.followService.getByUserAndFollow(userID, body);
  }
}
