import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field()
  readonly name: string;

  @Field()
  readonly email: string;

  @Field()
  readonly password: string;
}

@InputType()
export class updateUserInput {
  @Field()
  readonly _id: string;

  @Field({ nullable: true })
  readonly name?: string;

  @Field({ nullable: true })
  readonly email?: string;

  @Field({ nullable: true })
  readonly password?: string;
}

@InputType()
export class findUserInput {
  @Field()
  readonly _id: string;
}
