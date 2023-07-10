import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto, ProductDto } from './dto.bak/product.dto';
import { IProductDb } from '../../models/product.model';
import { IAccountDb } from '../../models/account.model';
import * as mongoose from 'mongoose';
import {
  Product,
  ProductsFilter,
  SortOrder,
  Binary,
  ProductSortInput,
  DeleteProductInput,
  CreateProductInput,
  UpdateProductInput,
} from '../../interface/products';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('products')
    private readonly productModel: Model<IProductDb>,
    @InjectModel('accounts')
    private readonly accountModel: Model<IAccountDb>,
  ) {}
  async updateProduct(
    input: UpdateProductInput,
    context: any,
  ): Promise<Product> {
    const { id, body } = input;

    // Find the product by ID
    const existingProduct = await this.productModel.findById(id).exec();

    // Check if the product exists
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Update the product fields
    existingProduct.name = body.name || existingProduct.name;
    existingProduct.description =
      body.description || existingProduct.description;

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    // Construct the updated product DTO
    const productDto: Product = {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      owner: context.req.claims.id,
    };

    return productDto;
  }
  async createProduct(
    input: CreateProductInput,
    context: any,
  ): Promise<Product> {
    const user = await this.accountModel
      .findById(context.req.claims.id)
      .select('_id name email')
      .exec();
    const createdProduct = await this.productModel.create({
      name: input.name,
      description: input.description,
      owner: new mongoose.Types.ObjectId(context.req.claims.id),
    });

    const productDto: Product = {
      id: createdProduct._id.toString(),
      name: createdProduct.name,
      description: createdProduct.description,
      owner: context.req.claims.id,
    };
    return productDto;
  }
  async findOwner(ownerId: string): Promise<any> {
    const owner = await this.accountModel.findById(ownerId).exec();
    return owner;
  }
  async listProducts(
    first = 10,
    after: Binary,
    filter: ProductsFilter,
    sort: ProductSortInput,
    context: any,
  ): Promise<Product[]> {
    const sortKey = sort.name || '_id';
    const aggregationPipeline = [];
    // Filter stage
    // const id = new mongoose.Types.ObjectId();

    const filterStage = {
      $match: {
        ...(filter.id && {
          _id: {
            ...(filter.id.eq && {
              $eq: new mongoose.Types.ObjectId(filter.id.eq),
            }),
            ...(filter.id.ne && {
              $ne: new mongoose.Types.ObjectId(filter.id.ne),
            }),
            ...(filter.id.in &&
              filter.id.in.length > 0 && {
                $in: filter.id.in.map((id) => new mongoose.Types.ObjectId(id)),
              }),
            ...(filter.id.nin &&
              filter.id.nin.length > 0 && {
                $nin: filter.id.nin.map(
                  (id) => new mongoose.Types.ObjectId(id),
                ),
              }),
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
        // ...(after && {
        //   [sortKey]: { $gt: new mongoose.Types.ObjectId(after.toString()) },
        // }),
      },
    };

    aggregationPipeline.push(filterStage);

    // Sorting stage
    if (sort) {
      const sortStage = { $sort: {} };
      Object.keys(sort).forEach((field) => {
        sortStage.$sort[field] = sort[field] === SortOrder.ASC ? 1 : -1;
      });
      aggregationPipeline.push(sortStage);
    }

    // Limit stage
    aggregationPipeline.push({ $limit: first + 1 });

    // Execute the aggregation pipeline
    const products = await this.productModel
      .aggregate(aggregationPipeline)
      .exec();
    const mappedProducts: Product[] = products.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      owner: context.req.claims.id,
    }));

    return mappedProducts;
  }
  async deleteProduct(
    product: DeleteProductInput,
    context: any,
  ): Promise<boolean> {
    const productId = product.id;

    const existingProduct = await this.productModel.findById(productId).exec();

    // Check if the product exists
    if (!existingProduct) throw new NotFoundException('Product not found');

    // Check if the user is the owner of the product
    if (existingProduct.owner.toString() !== context.id)
      throw new ForbiddenException('Cannot delete product');

    // Perform the deletion operation
    const deletionResult = await this.productModel
      .deleteOne({ _id: productId })
      .exec();

    // Check if the deletion was successful
    if (deletionResult && deletionResult.deletedCount === 1) {
      return true;
    } else {
      return false;
    }
  }
  async findProductById(productId: string): Promise<Product> {
    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const productDto: any = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      owner: product.owner.toString(),
    };

    return productDto;
  }
}
