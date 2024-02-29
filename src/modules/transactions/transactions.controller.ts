import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  Query,
  Delete,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Transaction } from 'src/schemas/transaction.schema';
import { TransactionService } from './transactions.service';
import { Public, Roles } from 'src/configs/configuration';
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
  async create(@Body() body, @Req() req) {
    const userID = req.user.id;
    return this.transactionService.createTransaction(userID, body.value);
  }
  @Put('change-status')
  async changStatus(@Body() body) {
    return this.transactionService.changeStatus(body.id, body.status);
  }

  @Get('find-status')
  async findByStatus(@Query('status') status: string) {
    return this.transactionService.findByStatus(status);
  }

  @Get()
  async findAll() {
    return this.transactionService.findAll();
  }

  @Get(`user`)
  async findByUser(@Req() req) {
    const userID = req.user.id;
    return this.transactionService.findByUser(userID);
  }
}
