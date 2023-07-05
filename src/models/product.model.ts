import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: string;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  user: Types.ObjectId | string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
