import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaTypes } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

@Schema()
export class Group {
  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'User',
  })
  buyerId: string;

  @Prop({
    type: SchemaTypes.Types.ObjectId,
    ref: 'User',
  })
  sellerId: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
