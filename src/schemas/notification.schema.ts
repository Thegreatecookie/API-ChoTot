import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type NotificationDocument = Document<Notification>;

@Schema({ collection: 'notification',timestamps: { createdAt: true }, })
export class Notification {
  @Prop({ type: String })
  userID: string;
  @Prop({ type: String })
  message: string;
  @Prop({ type: Boolean, default: false })
  status: boolean;
  @Prop({ type: Date })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
