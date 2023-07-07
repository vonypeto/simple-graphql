import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountDbSchema } from '../../models/account.model';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountResolver } from '../../resolvers/accounts.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: 'accounts', schema: AccountDbSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('SECRET_KEY'),
        };
      },
    }),
  ],
  providers: [AccountService, AccountResolver],
  exports: [AccountService, AccountResolver],
})
export class AccountModule {}
