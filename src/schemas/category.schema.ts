import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type CategoryDocument = Document<Category>;

@Schema({ collection: 'categories' })
export class Category {
  @Prop({ required: true, type: String, index: true })
  name: string;
  @Prop({ required: true, type: String })
  slug: string;
  @Prop({ required: true, type: Boolean, default: false })
  active: boolean;
  @Prop({ type: Date })
  createdAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
