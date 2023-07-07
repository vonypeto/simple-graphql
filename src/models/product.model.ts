import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface IProductDb {
  name: string;
  description: string;
  owner: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends Document implements Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'accounts', required: true })
  owner: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
