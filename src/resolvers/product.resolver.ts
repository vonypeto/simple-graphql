import { Mutation, Resolver, Args, Context, Query } from '@nestjs/graphql';
import { ProductService } from '../services/product/product.service';
import {
  Product,
  ProductsFilter,
  Binary,
  PageInfo,
  ProductEdge,
  ProductConnection,
  CreateProductInput,
  DeleteProductInput,
  ProductSortInput,
} from '../interface/products';

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
    @Args('first') first = 10,
    @Args('after') after: Binary,
    @Args('filter') filter: ProductsFilter,
    @Args('sort') sort: ProductSortInput,
  ): Promise<ProductConnection> {
    const products = await this.productService.listProducts(
      first,
      after,
      filter,
      sort,
    );

    // Create ProductEdges with cursors
    const edges: ProductEdge[] = products.map((product) => ({
      cursor: product.id,
      node: product,
    }));

    // Determine if there is a next page based on the number of products returned
    const hasNextPage = products.length > first;

    // Get the end cursor from the last product in the array
    const endCursor = hasNextPage ? edges[edges.length - 1].cursor : undefined;

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

  @Mutation('deleteProduct')
  async deleteProduct(
    @Args('input') input: DeleteProductInput,
    @Context() context: any,
  ): Promise<boolean> {
    return this.productService.deleteProduct(input, context.req.claims);
  }
}
