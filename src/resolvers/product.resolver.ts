import { Mutation, Resolver, Args, Context } from '@nestjs/graphql';
import { ProductService } from '../services/product/product.service';

interface CreateProductInput {
  name: string;
  description: string;
}

interface UpdateProductInput {
  id: string;
  body: UpdateProductBody;
}

interface UpdateProductBody {
  name?: string;
  description?: string;
}

interface DeleteProductInput {
  id: string;
}
interface Node {
  id: string;
}

interface Account extends Node {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface Product extends Node {
  id: string;
  name: string;
  description: string;
  owner: Account;
  createdAt: string;
  updatedAt: string;
}
@Resolver()
export class ProductResolver {
  // constructor(private readonly productService: ProductService) {}

  @Mutation('createProduct')
  async createProduct(
    @Args('input') input: CreateProductInput,
    @Context() context: any,
  ): Promise<Product> {
    //   const user = await this.productService.createProduct(input);

    const fakeProduct: Product = {
      id: 'fakeId',
      name: input.name,
      description: input.description,
      owner: {
        id: 'fakeOwnerId',
        name: 'John',
        email: 'johndoe@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Return the fake product
    return fakeProduct;
  }
}
