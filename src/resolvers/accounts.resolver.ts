import { Resolver, Args, Mutation, Context, Query } from '@nestjs/graphql';
import { AccountService } from '../services/account/account.service';
import {
  UserData,
  Authentication,
  SignUpInput,
  AuthenticateInput,
} from '../interface/user';

@Resolver('Account')
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Mutation('signUp')
  async signUp(@Args('input') input: SignUpInput): Promise<Authentication> {
    const user = await this.accountService.register(input);
    // const user = await createUser(input.email, input.name, input.password);
    const token = await this.accountService.generateToken(user.id, '1d');
    return {
      user,
      token,
    };
  }

  @Mutation('authenticate')
  async authenticate(
    @Args('input') input: AuthenticateInput,
  ): Promise<Authentication> {
    const user = await this.accountService.login(input);

    // const user = await createUser(input.email, input.name, input.password);
    const token = await this.accountService.generateToken(user.id, '1d');
    return {
      user,
      token,
    };
  }

  @Query()
  async me(@Context() context: any): Promise<UserData> {
    if (!context.req.claims) {
      throw new Error('Unauthorized');
    }
    const user = await this.accountService.findbyId(context.req.claims);
    // Return the user directly instead of wrapping it in an object
    return user;
  }
}
