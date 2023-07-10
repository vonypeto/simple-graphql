import { AccountService } from '../../src/services/account/account.service';
import { ProductService } from '../../src/services/product/product.service';
import fixtures from '../fixtures';
import { faker } from '@faker-js/faker';

describe('Mutation.deleteProduct', () => {
  test.concurrent('should be able to delete product', async () => {
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

    // Create a product
    const input = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
    };
    const context = {
      req: {
        claims: {
          id: registeredUser.id.toString(),
        },
      },
    };
    const createProduct = await productService.createProduct(input, context);

    // Set the user's claims in the request context
    let token = await accountService.generateToken(
      registeredUser.id.toString(),
      '1d',
    );

    // Perform the deleteProduct mutation
    const result = await request
      .send(
        JSON.stringify({
          query: `
            mutation ($input: DeleteProductInput!) {
              deleteProduct(input: $input)
            }
          `,
          variables: {
            input: {
              id: createProduct.id,
            },
          },
        }),
      )
      .set('Authorization', `Bearer ${token}`);

    // Assert the response
    expect(result.body.data.deleteProduct).toBe(true);

    await teardown();
  });
  test.concurrent('should throw an error if product not found', async () => {
    const { app, request, teardown } = await fixtures();

    const accountService: AccountService = app.get(AccountService);

    // Sign up the user first
    const name = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const registeredUser = await accountService.register({
      name,
      email,
      password,
    });

    let token = await accountService.generateToken(
      registeredUser.id.toString(),
      '1d',
    );

    const result = await request
      .send(
        JSON.stringify({
          query: `
            mutation ($input: DeleteProductInput!) {
              deleteProduct(input: $input)
            }
          `,
          variables: {
            input: {
              id: registeredUser.id.toString(),
            },
          },
        }),
      )
      .set('Authorization', `Bearer ${token}`);

    // Assert the error response
    expect(result.body.data).toBeNull();
    expect(result.body.errors).toHaveLength(1);
    expect(result.body.errors[0].message).toBe('Product not found');

    await teardown();
  });

  test.concurrent(
    'should throw an error if product ID is invalid',
    async () => {
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

      // Set the user's claims in the request context
      let token = await accountService.generateToken(
        registeredUser.id.toString(),
        '1d',
      );

      // Perform the deleteProduct mutation with an invalid product ID
      const result = await request
        .send(
          JSON.stringify({
            query: `
            mutation ($input: DeleteProductInput!) {
              deleteProduct(input: $input)
            }
          `,
            variables: {
              input: {
                id: name.toString(), // Invalid product ID
              },
            },
          }),
        )
        .set('Authorization', `Bearer ${token}`);

      // Assert the error response
      expect(result.body.data).toBeNull();
      expect(result.body.errors).toHaveLength(1);
      expect(result.body.errors[0].message).toBe(
        `Cast to ObjectId failed for value \"${name}\" (type string) at path "_id" for model "products"`,
      );

      await teardown();
    },
  );
});
