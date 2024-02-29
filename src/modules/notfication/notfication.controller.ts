import { Controller, Post, Body, Query, Req, Get, Put } from '@nestjs/common';
import { NotificationsService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  sendNotification(@Body() payload: { userId: string; message: string }) {
    const { userId, message } = payload;
    this.notificationsService.sendNotification(userId, message);
    return { success: true };
  }

  @Get('list')
  async getListNotifications(@Req() req) {
    const userID = req.user.id;
    return await this.notificationsService.getList(userID);
  }

  @Get('unread/count')
  async countUnreadNotifications(@Req() req) {
    const userID = req.user.id;
    return await this.notificationsService.countUnreadNotifications(userID);
  }

  @Put('read-one')
  async readOne(@Req() req, @Body() body: { notificationID: string }) {
    const userID = req.user.id;
    return await this.notificationsService.markRead(
      userID,
      body.notificationID,
    );
  }
  @Put('read-all')
  async readAll(@Req() req) {
    const userID = req.user.id;
    return await this.notificationsService.markAllRead(userID);
  }
}
