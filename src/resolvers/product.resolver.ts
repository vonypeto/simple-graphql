import {
  Mutation,
  Resolver,
  Args,
  Context,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
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
  UpdateProductInput,
} from '../interface/products';
import { AccountService } from '../services/account/account.service';

@Resolver('Product')
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly accountService: AccountService,
  ) {}
  @Mutation('updateProduct')
  async updateProduct(
    @Args('input') input: UpdateProductInput,
    @Context() context: any,
  ): Promise<Product> {
    return this.productService.updateProduct(input, context);
  }
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

  @ResolveField('owner')
  async owner(@Parent() product: Omit<Product, 'owner'> & { owner: string }) {
    return this.accountService.findById(product.owner);
  }

  @Query('products')
  async listProducts(
    @Args('first') first = 10,
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
