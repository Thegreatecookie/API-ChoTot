import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type UserDocument = Document<User>;

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
})
export class User {
  @Prop({ type: String, text: true })
  firstName: string;

  @Prop({ type: String, text: true })
  lastName: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  email: string;

  @Prop({ type: String, default: 'Chưa xác thực' })
  emailVerified: string;

  @Prop({ unique: true, index: true, type: String })
  phone: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ default: 'Cá nhân', type: String })
  role: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ default: null, type: Date })
  updatedAt: Date;

  @Prop({ default: 0, type: Number })
  balance: number;

  @Prop({ default: false, type: Boolean })
  phoneVerified: boolean;

  @Prop({ unique: true, type: String })
  CCID: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  address: object;
  
  @Prop({ type: Date })
  partnerExpiredAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
