import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { faker } from '@faker-js/faker';

export default async function () {
  const mongo = await MongoMemoryServer.create();
  const secretKey = faker.string.alphanumeric(16);
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue(
      new ConfigService({
        MONGODB_URI: mongo.getUri(),
        SECRET_KEY: secretKey,
      }),
    )
    .compile();

  const app = moduleFixture.createNestApplication();

  const httpAdapterHost = app.get(HttpAdapterHost);
  const server = httpAdapterHost.httpAdapter.getHttpServer();
  await app.init();

  const listenAsync = () =>
    new Promise((resolve, reject) => {
      server.listen(0, (err: any) => {
        if (err) {
          reject(err);
        } else {
          const { port } = server.address();
          resolve(port);
        }
      });
    });
  const port = await listenAsync();

  const request = supertest(`http://localhost:${port}`)
    .post('/graphql')
    .set('Content-Type', 'application/json');

  return {
    request,
    teardown: async () => {
      await app.close();
      await mongo.stop();
    },
    app,
  };
}
