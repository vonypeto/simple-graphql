import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAccountDb } from '../../models/account.model';
import { UserDto } from './dto/user.dto';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('accounts') private readonly accountModel: Model<IAccountDb>,
  ) {}

  async create(
    accountData: Partial<IAccountDb>,
  ): Promise<{ user: UserDto; token: string }> {
    console.log(accountData);
    const account = new this.accountModel(accountData);
    const createdAccount = await account.save();
    const user = this.mapToUserDto(createdAccount);
    const token = this.generateToken(user._id); // Generate JWT token

    return { user, token };
  }

  private mapToUserDto(account: IAccountDb): UserDto {
    const { _id, name, email, password } = account;
    return { _id, name, email, password, token: null };
  }
  private generateToken(userId: string): string {
    const token = sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });
    return token;
  }
}
