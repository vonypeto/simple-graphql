import { Model } from 'mongoose';
import { ProductService } from './product.service';
import { CreateProductDto, ProductDto } from './dto.bak/product.dto';
import { IProductDb } from '../../models/product.model';
import { IAccountDb } from '../../models/account.model';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
describe('ProductService', () => {
  let productService: ProductService;
  let productModel: Model<IProductDb>;
  let accountModel: Model<IAccountDb>;

  it('should create a product', async () => {
    productModel = {} as Model<IProductDb>;
    accountModel = {} as Model<IAccountDb>;
    productService = new ProductService(productModel, accountModel);

    // Mock input data
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'This is a test product',
    };

    // Mock context object with claims
    const context = {
      req: {
        claims: {
          id: '64aa0dd8a4d19d3b21ae5097', // Replace with the desired user ID
        },
      },
    };

    // Mock the accountModel findById method
    accountModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId('64aa0dd8a4d19d3b21ae5097'),
      }),
    });
    let ids = mongoose.Types.ObjectId;
    // Mock the productModel create method
    const createdProduct: any = {
      _id: ids,
      name: createProductDto.name,
      description: createProductDto.description,
    };
    productModel.create = jest.fn().mockResolvedValue(createdProduct);

    // Call the createProduct method
    const result: ProductDto = await productService.createProduct(
      createProductDto,
      context,
    );
    console.log(result);
    // Assertions
    // expect(accountModel.findById).toHaveBeenCalledWith(
    //   '64aa0dd8a4d19d3b21ae5097',
    // );
    expect(productModel.create).toHaveBeenCalledWith({
      name: createProductDto.name,
      description: createProductDto.description,
      owner: new mongoose.Types.ObjectId('64aa0dd8a4d19d3b21ae5097'),
    });
    expect(result).toEqual({
      id: ids,
      name: createProductDto.name,
      description: createProductDto.description,
      owner: {
        id: '64aa0dd8a4d19d3b21ae5097',
      },
    });
  });
});
