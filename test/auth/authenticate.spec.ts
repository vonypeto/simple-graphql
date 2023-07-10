import { AccountService } from '../../src/services/account/account.service';
import fixtures from '../fixtures';
import { faker } from '@faker-js/faker';
describe('Mutation.authenticate', () => {
  test.concurrent(
    'should be able to call authenticate mutation and get the token',
    async () => {
      const { app, request, teardown } = await fixtures();

      const accountService: AccountService = app.get(AccountService);
      // Sign up the user first
      const name = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password();

      await accountService.register({
        name,
        email,
        password,
      });

      const result = await request
        .send(
          JSON.stringify({
            query: `
            mutation ($input: AuthenticateInput!){
              authenticate(input: $input) {
                token
              }
            }
          `,
            variables: {
              input: {
                email,
                password,
              },
            },
          }),
        )
        .expect(200);

      expect(result.body.data.authenticate).toHaveProperty('token');
      await teardown();
    },
  );

  test.concurrent(
    'should be able to call authenticate mutation and get invalid username and password',
    async () => {
      const { request, teardown } = await fixtures();

      // Sign up the user first
      const name = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password();

      const result = await request
        .send(
          JSON.stringify({
            query: `
            mutation ($input: AuthenticateInput!){
              authenticate(input: $input) {
                token
              }
            }
          `,
            variables: {
              input: {
                email,
                password,
              },
            },
          }),
        )
        .expect(200);

      expect(result.body.data).toBeNull();
      expect(result.body.errors).toBeDefined();
      expect(result.body.errors[0].message).toBe('Invalid email');

      await teardown();
    },
  );
});
