import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from '../../models/product.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ProductResolver } from '../../resolvers/product.resolver';
import { AccountDbSchema } from '../../models/account.model';
import { AccountService } from '../account/account.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: 'products', schema: ProductSchema },
      { name: 'accounts', schema: AccountDbSchema },
    ]),
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
  providers: [ProductService, ProductResolver, AccountService, ProductResolver],
  exports: [ProductService, ProductResolver],
})
export class ProductModule {}
