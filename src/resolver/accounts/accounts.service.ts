import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAccountDb } from '../../models/account.model';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('accounts') private readonly accountModel: Model<IAccountDb>,
  ) {}

  async create(accountData: Partial<IAccountDb>): Promise<IAccountDb> {
    const account = new this.accountModel(accountData);
    return account.save();
  }

  async findById(id: string): Promise<IAccountDb | null> {
    return this.accountModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IAccountDb | null> {
    return this.accountModel.findOne({ email }).exec();
  }
}
