import { Query, Resolver, Context } from '@nestjs/graphql';
import { Request } from 'express';

@Resolver()
export class AppService {
  @Query(() => String)
  sayHello(@Context() context: any): string {
    const request: Request = context.req;
    console.log('Request:', request);
    return 'Hello World!';
  }
}
