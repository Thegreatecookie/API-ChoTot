import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type CodeVerifyDocument = Document<CodeVerify>;

@Schema({ collection: 'codeverifies' })
export class CodeVerify {
  @Prop({ required: true, type: String, index: true })
  userID: string;
  @Prop({ required: true, type: String })
  token: string;
}

export const CodeVerifySchema = SchemaFactory.createForClass(CodeVerify);
