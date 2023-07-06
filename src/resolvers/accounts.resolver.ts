import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';

type UserInput = {
  name: string;
  email: string;
  passwword: string;
};

@Resolver()
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}
  @Mutation('signUp')
  async signUp(@Args('input') input: UserInput): Promise<{ token: string }> {
    const user = await this.accountService.create(input);
    return { token: await this.accountService.generateToken(user.id) };
  }
}
