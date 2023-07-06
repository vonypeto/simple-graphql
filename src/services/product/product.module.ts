import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from 'src/models/product.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

Module({
  imports: [
    MongooseModule.forFeature([{ name: 'accounts', schema: ProductSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('SECRET_KEY'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  providers: [ProductService],
  exports: [ProductService],
});
export class ProductModule {}
