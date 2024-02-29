import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type TransactionDocument = Document<Transaction>;

@Schema({ collection: 'transactions', timestamps: { createdAt: true } })
export class Transaction {
  @Prop({ type: String })
  name: string;
  @Prop({ type: String })
  userID: string;
  @Prop({ type: Number })
  value: number;
  @Prop({ type: String, default: 'Chờ duyệt' })
  status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
