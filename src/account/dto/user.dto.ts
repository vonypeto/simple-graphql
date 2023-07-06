import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly name: string;

  @Field()
  readonly email: string;

  @Field()
  readonly password: string;

  @Field()
  readonly token: string;
}
