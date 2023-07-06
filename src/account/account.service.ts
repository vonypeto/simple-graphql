import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAccountDb } from '../models/account.model';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel('accounts') private readonly accountModel: Model<IAccountDb>,
    private readonly jwtService: JwtService,
  ) {}

  async create(accountData: Partial<IAccountDb>) {
    const createdAccount = await new this.accountModel(accountData).save();
    return this.mapToUserDto(createdAccount);
  }

  private mapToUserDto(account: IAccountDb): UserDto {
    const { _id, name, email, password } = account;
    return { id: _id, name, email, password, token: null };
  }

  async generateToken(id: string) {
    const token = await this.jwtService.signAsync({ id });
    return token;
  }
}
