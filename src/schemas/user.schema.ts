import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type UserDocument = Document<User>;

@Schema({
  collection: 'users',
  timestamps: { createdAt: true, updatedAt: true },
})
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  email: string;

  @Prop({ unique: true, index: true, type: String })
  phone: string;

  @Prop()
  gender: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ default: 'normal' })
  role: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  address: string;
  // @Prop({ type: mongoose.Schema.Types.Mixed })
  // address: object;
}

export const UserSchema = SchemaFactory.createForClass(User);
