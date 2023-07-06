import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { AccountsService } from './accounts.service';
import { UserDto } from './dto/user.dto';
import { UserInput } from './inputs/user.input';
@Resolver(() => AccountsService)
export class AccountResolver {
  constructor(private readonly accountsService: AccountsService) {}

  // This is just a test kit
  @Query(() => UserDto)
  async getAccountById(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<string | null> {
    const { authorization } = context.req;
    console.log(authorization);
    return 'Hello';
  }
  @Mutation(() => UserDto)
  async register(
    @Args('input') input: UserInput,
    @Context() context: any,
  ): Promise<UserDto> {
    // const { authorization } = context.req;
    // console.log(authorization);

    const { user, token } = await this.accountsService.create({
      // email: authorization.username,
      // password: authorization.password,
      ...input,
    });
    console.log(token);
    return { ...user, token };
  }
}
