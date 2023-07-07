import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigService } from '@nestjs/config';

export default async function () {
  const mongo = await MongoMemoryServer.create();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue(
      new ConfigService({
        MONGODB_URI: mongo.getUri(),
        SECRET_KEY: '123',
      }),
    )
    .compile();
  const app = moduleFixture.createNestApplication();
  await app.listen(3000);

  const request = supertest(app.getHttpServer())
    .post('/graphql')
    .set('Content-Type', 'application/json');

  return {
    request,
    teardown: async () => {
      await app.close();
      await mongo.stop();
    },
  };
}
