import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type FollowDocument = Document<Follow>;

@Schema({ collection: 'follow' })
export class Follow {
  @Prop({ type: String})
  userID: string;
  @Prop({ type: String })
  followedID: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
