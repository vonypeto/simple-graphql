import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IAccountDb extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class AccountDb extends Document {
  @Prop()
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  toJSON() {
    const { _id, ...rest } = this.toObject();
    return { account_id: _id, ...rest };
  }
}
export type AccountDocument = AccountDb & Document;

export const AccountDbSchema = SchemaFactory.createForClass(AccountDb);
