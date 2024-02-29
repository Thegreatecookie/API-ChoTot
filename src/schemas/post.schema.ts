import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type PostDocument = Document<Post>;

@Schema({
  collection: 'posts',
  timestamps: { createdAt: true },
})
export class Post {
  @Prop({ type: String, index: true })
  userID: string;

  @Prop({ type: String, index: true })
  categoryID: string;

  @Prop({ type: String, text: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String] })
  image_path: string[];

  @Prop({ default: 'pending', type: String })
  status: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ default: null, type: Date })
  expiredAt: Date;

  @Prop({ default: null, type: Date })
  approvedAt: Date;

  @Prop({ default: null, type: Date })
  rejectedAt: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  address: Object;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  detailsPost: Object;

  @Prop({ type: String, default: null })
  reason: String;

  @Prop({ type: Date, default: null })
  promotedStartAt: Date;

  @Prop({ type: Date, default: null })
  promotedEndAt: Date;

  @Prop({ type: Boolean, default: false })
  isPromoted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
