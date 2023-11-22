import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type PostDocument = Document<Post>;

@Schema({
  collection: 'posts',
  timestamps: { createdAt: true },
})
export class Post {
  @Prop()
  userID: string;

  @Prop()
  categoryID: string;

  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  manufactor: string;

  @Prop({ required: true })
  expert: string;

  @Prop()
  color: string;

  @Prop()
  image_path: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: null })
  createdAt: Date;

  @Prop({ default: null })
  expiredAt: Date;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ required: true })
  address: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  detailsPost: object;
}

export const PostSchema = SchemaFactory.createForClass(Post);
