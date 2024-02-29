import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as SchemaTypes } from 'mongoose';
export type ChatDocument = Document<Chat>;

@Schema({ collection: 'chats', timestamps: { createdAt: true } })
export class Chat {
  @Prop({ type: SchemaTypes.Types.ObjectId, ref: 'User' })
  userId: string;
  @Prop({ required: true, type: String })
  text: string;
  @Prop({ type: SchemaTypes.Types.ObjectId, ref: 'Group' })
  groupId: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
