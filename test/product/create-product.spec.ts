import { AccountService } from '../../src/services/account/account.service';
import { ProductService } from '../../src/services/product/product.service';
import fixtures from '../fixtures';
import { faker } from '@faker-js/faker';
import * as mongoose from 'mongoose';
describe('Mutation.createProduct', () => {
  test.concurrent('should be able to create product', async () => {
    const { app, request, teardown } = await fixtures();

    const accountService: AccountService = app.get(AccountService);
    const productService: ProductService = app.get(ProductService);

    // Sign up the user first
    const name = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const registeredUser = await accountService.register({
      name,
      email,
      password,
    });

    const input = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
    };

    // Set the user's claims in the request context

    let token = await accountService.generateToken(
      registeredUser.id.toString(),
      '1d',
    );

    // Perform the createProduct mutation
    const result = await request
      .send(
        JSON.stringify({
          query: `
            mutation ($input: CreateProductInput!){
              createProduct(input: $input) {
                id
                name
                description
                owner {
                  id
                  name
                  email
                }
              }
            }
          `,
          variables: {
            input,
          },
        }),
      )
      .set('Authorization', `Bearer ${token}`);

    // Assert the response
    expect(result.body.data.createProduct).toEqual({
      id: expect.any(String),
      name: input.name,
      description: input.description,
      owner: {
        id: registeredUser.id.toString(),
        name: registeredUser.name,
        email: registeredUser.email,
      },
    });

    await teardown();
  });
});
