import { Test, TestingModule } from '@nestjs/testing';
import { ProductModule } from './product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('ProductModule', () => {
  test.concurrent('should be defined', async () => {
    const mongo: MongoMemoryServer = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: mongo.getUri(),
          }),
        }),
        ProductModule,
      ],
    }).compile();
    await module.init();
    expect(module).toBeDefined();

    await module.close();
    await mongo.stop();
  });
});
