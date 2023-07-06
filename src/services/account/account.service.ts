import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAccountDb } from '../../models/account.model';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AccountService {
  constructor(
    @InjectModel('accounts') private readonly accountModel: Model<IAccountDb>,
    private readonly jwtService: JwtService,
  ) {}
  async register(accountData: Partial<IAccountDb>) {
    const existingAccount = await this.accountModel.findOne({
      email: accountData.email,
    });
    if (existingAccount) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(accountData.password, 10);
    const createdAccount = await new this.accountModel({
      email: accountData.email,
      name: accountData.name,
      password: hashedPassword,
    }).save();
    return this.mapToUserDto(createdAccount);
  }
  async findbyId(accountData: Partial<IAccountDb>) {
    const { id } = accountData;
    console.log(accountData);
    // Find the account with the provided email
    const account = await this.accountModel.findById(id);

    return this.mapToUserDto(account);
  }
  async login(accountData: Partial<IAccountDb>) {
    const createdAccount = await new this.accountModel(accountData).save();
    return this.mapToUserDto(createdAccount);
  }

  private mapToUserDto(account: IAccountDb): UserDto {
    const { _id, name, email, password, createdAt, updatedAt } = account;
    return { id: _id, name, email, password, createdAt, updatedAt };
  }

  async generateToken(id: string) {
    const token = await this.jwtService.signAsync({ id });
    return token;
  }
}
