import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { Notification } from 'src/schemas/notification.schema';

@Injectable()
export class NotificationsService {
  private readonly clients: Map<string, Socket> = new Map();
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  addClient(userId, client: Socket): void {
    this.clients.set(userId, client);
  }

  removeClient(userId): void {
    this.clients.delete(userId);
  }

  async sendNotification(userId: string, message: string) {
    const client = this.clients.get(userId);
    await this.create(userId, message);
    const unreadQuantity = await this.notificationModel.countDocuments({
      status: false,
      userID: userId,
    });

    if (client) {
      client.emit('notification', { message, unreadQuantity });
    }
  }
  async create(userID: string, message: string) {
    const createdNotification = new this.notificationModel({ userID, message });
    return await createdNotification.save();
  }
  async getList(userID: string) {
    const list = this.notificationModel
      .find({ userID: userID })
      .sort({ createdAt: -1,status:1 });
    return await list;
  }

  async countUnreadNotifications(userId: string) {
    const unreadQuantity = await this.notificationModel.countDocuments({
      status: false,
      userID: userId,
    });

    return { unreadQuantity };
  }

  async markRead(userID: string, notificationID: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationID,
      userID,
    });
    if (notification) {
      return await this.notificationModel.updateOne(
        { _id: notificationID },
        { status: true },
      );
    }
  }
  async markAllRead(userID: string) {
    return await this.notificationModel.updateMany(
      { userID: userID },
      { status: true },
    );
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkCreatedTime() {
    const data = await this.notificationModel.find({
      createdAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    });
    if (!data.length) return null;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      await this.notificationModel.deleteOne({ _id: element._id });
    }
    
  }
}
