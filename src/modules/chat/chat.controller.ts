import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDTO } from 'src/dto/create-chat.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @Get('find')
  // async find(
  //   @Query('postID') postID,
  //   @Query('otherID') otherID,
  //   @Query('page', ParseIntPipe) page: number,
  //   @Query('pageSize', ParseIntPipe) pageSize: number,
  //   @Req() req,
  // ) {
  //   const userID = req.user.id;
  //   return await this.chatService.getAllMessage(
  //     postID,
  //     userID,
  //     otherID,
  //     page,
  //     pageSize,
  //   );
  // }
  @Get('findAll')
  async findAll(@Req() req) {
    const userID = req.user.id;
    return await this.chatService.getAllChat(userID);
  }
  @Get('findchat')
  async findChat(
    @Req() req,
    @Query('recipient') recipient: string,
    @Query('postID') postID: string,
  ) {
    const sender = req.user.id;
    return await this.chatService.findOneChat(sender, recipient, postID);
  }
  @Post('create')
  async create(@Body() body: CreateChatDTO, @Req() req) {
    body.sender = req.user.id;
    return await this.chatService.createMessage(body);
  }

  @Get('getAllRoom/:id')
  async getAllRoom(@Param('id') id) {
    return await this.chatService.getAllRoom(id);
  }

  @Get('getRoom/:id')
  async getRoom(@Param('id') id) {
    return await this.chatService.getRoom(id);
  }

  @Get('getAllMessages/:id')
  async getAllMessage(@Param('id') id) {
    return await this.chatService.getAllMessage(id);
  }
}
