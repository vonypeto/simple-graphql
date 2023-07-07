import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from './account.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
describe('AccountModule', () => {
  test.concurrent('should be initialized successfuly', async () => {
    const mongo = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => {
            return {
              uri: mongo.getUri(),
            };
          },
        }),
        AccountModule,
      ],
    }).compile();

    await module.init();
    await module.close();
    await mongo.stop();
  });
});
