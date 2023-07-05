import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IAccountDb extends Document {
  name: string;
  email: string;
  password: string;
}

@Schema({ timestamps: true })
export class AccountDb extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  toJSON() {
    const { _id, ...rest } = this.toObject();
    return { account_id: _id, ...rest };
  }
}

export const AccountDbSchema = SchemaFactory.createForClass(AccountDb);
