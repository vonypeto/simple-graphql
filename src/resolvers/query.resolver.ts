import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class QueryResolver {
  @Query('status')
  async status(): Promise<string> {
    return 'test';
  }
}
