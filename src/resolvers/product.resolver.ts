import { Mutation, Resolver, Args, Context, Query } from '@nestjs/graphql';
import { ProductService } from '../services/product/product.service';

interface CreateProductInput {
  name: string;
  description: string;
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
}

interface Product extends Node {
  id: string;
  name: string;
  description: string;
  owner: Account;
}
interface BinaryQueryOperatorInput {
  eq?: string;
  ne?: string;
  in?: string[];
  nin?: string[];
}

interface StringQueryOperatorInput {
  eq?: string;
  ne?: string;
  in?: string[];
  nin?: string[];
  startsWith?: string;
  contains?: string;
}

interface ProductsFilter {
  id?: BinaryQueryOperatorInput;
  name?: StringQueryOperatorInput;
}

type ProductSortInput = Record<string, SortOrder>;

enum SortOrder {
  ASC = 1,
  DESC = -1,
}

interface Binary {
  toString(): string;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor?: Binary;
}

interface ProductEdge {
  cursor: Binary;
  node: Product;
}
interface ProductConnection {
  edges: ProductEdge[];
  pageInfo: PageInfo;
}

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation('createProduct')
  async createProduct(
    @Args('input') input: CreateProductInput,
    @Context() context: any,
  ): Promise<Product> {
    const createdProduct = await this.productService.createProduct(
      input,
      context,
    );

    return createdProduct;
  }
  @Query('products')
  async listProducts(
    @Args('first') first: number = 10,
    @Args('after') after: Binary,
    @Args('filter') filter: ProductsFilter,
    @Args('sort') sort: ProductSortInput,
    @Context() context: any,
  ): Promise<ProductConnection> {
    const products = await this.productService.listProducts(
      first,
      after,
      filter,
      sort,
      context,
    );

    // Create ProductEdges with cursors
    const edges: ProductEdge[] = products.map((product) => ({
      cursor: product.id,
      node: product,
    }));

    // Determine if there is a next page based on the number of products returned
    const hasNextPage = products.length > first;

    // Get the end cursor from the last product in the array
    const endCursor = hasNextPage
      ? products[products.length - 1].id
      : undefined;

    // Construct the PageInfo object
    const pageInfo: PageInfo = {
      hasNextPage,
      endCursor,
    };

    // Construct the ProductConnection
    const productConnection: ProductConnection = {
      edges,
      pageInfo,
    };

    return productConnection;
  }
}
