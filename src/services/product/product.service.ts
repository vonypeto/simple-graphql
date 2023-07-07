import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto, ProductDto } from './dto/product.dto';
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
} from '../../interface/products';

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
    const user = await this.accountModel
      .findById(context.req.claims.id)
      .select('_id name email')
      .exec();
    const createdProduct = await this.productModel.create({
      name: input.name,
      description: input.description,
      owner: new mongoose.Types.ObjectId(context.req.claims.id),
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
    first = 10,
    after: Binary,
    filter: ProductsFilter,
    sort: ProductSortInput,
  ): Promise<Product[]> {
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
        ...(after && {
          _id: { $gt: new mongoose.Types.ObjectId(after.toString()) },
        }),
      },
    };

    aggregationPipeline.push(filterStage);

    // Populate owner field
    aggregationPipeline.push({
      $lookup: {
        let: { owner: '$owner' },
        from: 'accounts',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$owner'] },
            },
          },
          {
            // sub parent array
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
      },
    });

    // Unwind owner array
    aggregationPipeline.push({
      $unwind: {
        path: '$owner',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Sorting stage
    if (sort) {
      const sortStage = { $sort: {} };
      Object.keys(sort).forEach((field) => {
        sortStage.$sort[field] = sort[field] === SortOrder.ASC ? 1 : -1;
      });
      aggregationPipeline.push(sortStage);
    }

    // Limit stage
    aggregationPipeline.push({ $limit: first });

    // Execute the aggregation pipeline
    const products = await this.productModel
      .aggregate(aggregationPipeline)
      .exec();
    const mappedProducts: Product[] = products.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      owner: {
        id: product.owner?._id || '',
        name: product.owner?.name || '',
        email: product.owner?.email || '',
      },
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
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    //    and if the owner matches the current user
    if (!existingProduct || existingProduct.owner.toString() !== context.id) {
      throw new Error('Cannot delete product');
    }

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
}
