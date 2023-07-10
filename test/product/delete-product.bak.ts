import { AccountService } from '../../src/services/account/account.service';
import { ProductService } from '../../src/services/product/product.service';
import fixtures from '../fixtures';
import { faker } from '@faker-js/faker';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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
    const context = {
      req: {
        claims: {
          id: registeredUser.id.toString(),
        },
      },
    };
    const createdProduct = await productService.createProduct(input, context);

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
              id: createdProduct.id,
            },
          },
        }),
      )
      .set('Authorization', `Bearer ${token}`);

    // Assert the response
    expect(result.body.data.deleteProduct).toBe(true);

    // Verify that the product is deleted
    // expect(async () => {
    //   await productService.findOwner(createdProduct.id);
    // }).rejects.toThrow(NotFoundException);

    await teardown();
  });

  test.concurrent(
    'should not be able to delete product if not the owner',
    async () => {
      const { app, request, teardown } = await fixtures();

      const accountService: AccountService = app.get(AccountService);
      const productService: ProductService = app.get(ProductService);

      // Sign up two users
      const user1Name = faker.internet.userName();
      const user1Email = faker.internet.email();
      const user1Password = faker.internet.password();

      const user2Name = faker.internet.userName();
      const user2Email = faker.internet.email();
      const user2Password = faker.internet.password();

      const user1 = await accountService.register({
        name: user1Name,
        email: user1Email,
        password: user1Password,
      });

      const user2 = await accountService.register({
        name: user2Name,
        email: user2Email,
        password: user2Password,
      });

      const input = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
      };

      // Set user1's claims in the request context
      let token1 = await accountService.generateToken(
        user1.id.toString(),
        '1d',
      );
      const context1 = {
        req: {
          claims: {
            id: user1.id.toString(),
          },
        },
      };

      // Set user2's claims in the request context
      let token2 = await accountService.generateToken(
        user2.id.toString(),
        '1d',
      );
      const context2 = {
        req: {
          claims: {
            id: user2.id.toString(),
          },
        },
      };

      // Create a product with user1
      const createdProduct = await productService.createProduct(
        input,
        context1,
      );

      // Attempt to delete the product with user2
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
                id: createdProduct.id,
              },
            },
          }),
        )
        .set('Authorization', `Bearer ${token2}`);

      // Assert the response
      expect(result.body.data).toBeNull();
      expect(result.body.errors).toBeDefined();
      expect(result.body.errors[0].message).toBe('Cannot delete product');
      expect(result.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(result.body.errors[0].extensions.exception.constructor).toBe(
        ForbiddenException,
      );

      // Verify that the product still exists
      expect(async () => {
        const data = await productService.findProductById(createdProduct.id);
        console.log(data);
      }).resolves.toBeTruthy();

      await teardown();
    },
  );
});
