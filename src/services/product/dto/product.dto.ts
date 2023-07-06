import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class ProductDto {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly name: string;

  @Field()
  readonly description: string;

  @Field(() => OwnerDto)
  readonly owner: OwnerDto;
}

@InputType()
export class CreateProductDto {
  @Field()
  readonly name: string;

  @Field()
  readonly description: string;
}

@ObjectType()
export class OwnerDto {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly name: string;

  @Field()
  readonly email: string;
}
