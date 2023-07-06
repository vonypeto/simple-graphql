import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto, ProductDto } from './dto/product.dto';
import { IProductDb } from '../../models/product.model';
import { IAccountDb } from '../../models/account.model';

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
type ProductSortInput = Record<string, SortOrder>;

enum SortOrder {
  ASC = 1,
  DESC = -1,
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('products')
    private readonly productModel: Model<IProductDb>,
    @InjectModel('accounts')
    private readonly accountModel: Model<IAccountDb>,
  ) {}

  async createProduct(
    input: CreateProductDto,
    context: any,
  ): Promise<ProductDto> {
    // Your logic to create the product
    const user = await this.accountModel
      .findById(context.req.claims.id)
      .select('_id name email')
      .exec();
    const createdProduct = await this.productModel.create({
      name: input.name,
      description: input.description,
      owner: context.req.claims.id, // Assuming user._id is the ID of the owner account
    });

    const productDto: ProductDto = {
      id: createdProduct._id.toString(),
      name: createdProduct.name,
      description: createdProduct.description,
      owner: {
        id: context.req.claims.id,
        name: user.name,
        email: user.email,
      },
    };
    return productDto;
  }

  async listProducts(
    first: number = 10,
    after: Binary,
    filter: ProductsFilter,
    sort: ProductSortInput,
    context: any,
  ): Promise<Product[]> {
    const query = this.productModel.find({
      ...(filter.id && {
        _id: {
          ...(filter.id.eq && { $eq: filter.id.eq }),
          ...(filter.id.ne && { $ne: filter.id.ne }),
          ...(filter.id.in && filter.id.in.length > 0 && { $in: filter.id.in }),
          ...(filter.id.nin &&
            filter.id.nin.length > 0 && { $nin: filter.id.nin }),
        },
      }),
      ...(filter.name && {
        name: {
          ...(filter.name.eq && { $eq: filter.name.eq }),
          ...(filter.name.ne && { $ne: filter.name.ne }),
          ...(filter.name.in &&
            filter.name.in.length > 0 && { $in: filter.name.in }),
          ...(filter.name.nin &&
            filter.name.nin.length > 0 && { $nin: filter.name.nin }),
        },
      }),
    });
    // Apply sorting
    query.sort(sort);

    // Execute the query
    const products = await query.exec();

    const mappedProducts: Product[] = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      owner: {
        id: context.req.claims.id,
        name: 'random',
        email: 'random',
      },
    }));

    return mappedProducts.slice(0, first);
  }
}
