import { Body, Inject, Injectable, Post, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Transaction } from 'src/schemas/transaction.schema';
import { PostService } from '../posts/post.service';
import { TransactionStatus } from 'src/enums/transaction-status.enums';
import { UserService } from '../users/user.service';
import { User } from 'src/schemas/user.schema';
import { NotificationsService } from '../notfication/notification.service';
@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Transaction.name) private userModel: Model<User>,
    private userService: UserService,
    private notificationService: NotificationsService,
  ) {}

  async findAll() {
    const transactions = await this.transactionModel
      .find({
        status: {
          $in: [TransactionStatus.approved, TransactionStatus.rejected],
        },
      })
      .sort({ updatedAt: -1 })
      .lean();
    const data = await Promise.all(
      transactions.map(async (e) => {
        const user = await this.userService.findById(e.userID);
        return { ...e, phone: user.phone };
      }),
    );

    return data;
  }
  async findByUser(userID: string) {
    const transactions = await this.transactionModel
      .find({
        userID: userID,
      })
      .sort({ createdAt: -1 })
      .lean();

    return transactions;
  }

  async createTransaction(userID: string, value: number) {
    const createdTransaction = new this.transactionModel({ userID, value });
    return await createdTransaction.save();
  }

  async changeStatus(id: string, status: string) {
    const transaction = await this.transactionModel.findById(id);

    if (status === TransactionStatus.approved) {
      await this.userService.transaction(transaction.userID, transaction.value);
      await this.transactionModel.updateOne(
        { _id: id },
        { status: TransactionStatus.approved },
      );
      await this.notificationService.sendNotification(
        transaction.userID,
        `Đơn ${transaction._id} đã được duyệt`,
      );
    } else {
      await this.transactionModel.updateOne(
        { _id: id },
        { status: TransactionStatus.rejected },
      );
      await this.notificationService.sendNotification(
        transaction.userID,
        `Đơn ${transaction._id} đã bị từ chối`,
      );
    }
  }
  async findByStatus(status: string) {
    const transactions = await this.transactionModel
      .find({ status: status })
      .lean();
    const data = await Promise.all(
      transactions.map(async (e) => {
        const user = await this.userService.findById(e.userID);
        return { ...e, phone: user.phone };
      }),
    );

    return data;
  }
}
