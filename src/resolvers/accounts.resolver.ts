import { Resolver, Args, Mutation, Context, Query } from '@nestjs/graphql';
import { AccountService } from '../services/account/account.service';
import {
  UserData,
  Authentication,
  SignUpInput,
  AuthenticateInput,
} from 'src/interface/user';

@Resolver()
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Mutation('signUp')
  async signUp(
    @Args('input') input: SignUpInput,
    @Context() context: any,
  ): Promise<Authentication> {
    const user = await this.accountService.register(input);
    // const user = await createUser(input.email, input.name, input.password);
    const token = await this.accountService.generateToken(user.id);
    return {
      user,
      token,
    };
  }

  @Mutation('authenticate')
  async authenticate(
    @Args('input') input: AuthenticateInput,
    @Context() context: any,
  ): Promise<Authentication> {
    console.log(input);
    const user = await this.accountService.login(input);
    // const user = await createUser(input.email, input.name, input.password);
    const token = await this.accountService.generateToken(user.id);
    return {
      user,
      token,
    };
  }

  @Query()
  async me(@Context() context: any): Promise<UserData> {
    console.log(context.req.claims);
    if (!context.req.claims) {
      throw new Error('Unauthorized');
    }
    const user = await this.accountService.findbyId(context.req.claims);
    // Return the user directly instead of wrapping it in an object
    return user;
  }
}
