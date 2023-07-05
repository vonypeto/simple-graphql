import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountDbSchema } from 'src/models/account.model';
import { AccountsService } from './accounts.service';
import { AccountResolver } from './accounts.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'accounts', schema: AccountDbSchema }]),
  ],
  providers: [AccountsService, AccountResolver],
})
export class AccountsModule {}
