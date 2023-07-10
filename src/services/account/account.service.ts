import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAccountDb } from '../../models/account.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserData } from '../../interface/user';

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
    // Find the account with the provided email
    const account = await this.accountModel.findById(id);
    return this.mapToUserDto(account);
  }
  async login(accountData: Partial<IAccountDb>): Promise<UserData> {
    const { email, password } = accountData;

    // Find the account with the provided email
    const account = await this.accountModel.findOne({ email });

    if (!account) {
      throw new NotFoundException('Invalid email');
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }

    return this.mapToUserDto(account);
  }

  private mapToUserDto(account: any): UserData {
    const { _id, name, email, createdAt, updatedAt } = account;
    return { id: _id, name, email, createdAt, updatedAt };
  }
  async findById(id: string) {
    return this.accountModel.findById(id);
  }

  async generateToken(id: string, exp: string) {
    const token = await this.jwtService.signAsync(
      { id },
      { expiresIn: exp || '1d' },
    );
    return token;
  }
}
