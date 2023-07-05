import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountDbSchema } from 'src/models/account.model';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'accounts', schema: AccountDbSchema }]),
  ],
  providers: [AccountsService],
})
export class AccountsModule {}
