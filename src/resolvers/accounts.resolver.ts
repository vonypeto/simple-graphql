import { Resolver, Args, Mutation, Context, Query } from '@nestjs/graphql';
import { AccountService } from '../services/account/account.service';
import { v4 as uuidv4 } from 'uuid';

// type UserInput = {
//   name: string;
//   email: string;
//   passwword: string;
// };

interface User {
  id: string;
  email: string;
  name: string;
  // Additional user properties
}

interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional user properties
}
interface Authentication {
  user: User;
  token: string;
}
interface SignUpInput {
  email: string;
  name: string;
  password: string;
}
interface AuthenticateInput {
  email: string;
  password: string;
}
@Resolver()
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}
  // @Mutation('signUp2')
  // async signUp2(
  //   @Args('input') input: UserInput,
  //   @Context() context: any,
  // ): Promise<{ token: string }> {
  //   console.log('context', context);
  //   const user = await this.accountService.create(input);
  //   return { token: await this.accountService.generateToken(user.id) };
  // }

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
  async me(@Context() context: any): Promise<User> {
    console.log(context.req.claims);
    if (!context.req.claims) {
      throw new Error('Unauthorized');
    }
    const user = await this.accountService.findbyId(context.req.claims);
    // Return the user directly instead of wrapping it in an object
    return user;
  }
} //
async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<User> {
  // Placeholder logic to generate a random user
  const userId = uuidv4(); // Generate a random UUID for the user ID
  const user: User = {
    id: userId,
    email,
    name,
    // Additional user properties
  };

  // Logic to store the user in your data source (e.g., database)

  return user;
}

async function generateToken(userId: string): Promise<string> {
  // Placeholder logic to generate a random token
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Logic to store the token or associate it with the user in your data source

  return token;
}
