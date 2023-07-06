import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountDbSchema } from 'src/models/account.model';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountResolver } from 'src/resolvers/accounts.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'accounts', schema: AccountDbSchema }]),
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
  providers: [AccountService, AccountResolver],
  exports: [AccountService, AccountResolver],
})
export class AccountModule {}
