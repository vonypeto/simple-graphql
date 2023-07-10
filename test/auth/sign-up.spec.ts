import { AccountService } from '../../src/services/account/account.service';
import fixtures from '../fixtures';
import { faker } from '@faker-js/faker';

describe('Mutation.signUp', () => {
  test.concurrent(
    'should be able to call signUp mutation and get the token',
    async () => {
      const { request, teardown } = await fixtures();
      const result = await request
        .send(
          JSON.stringify({
            query: `
        mutation ($input: SignUpInput!){
          signUp(input: $input) {
            token
          }
        }
      `,
            variables: {
              input: {
                email: faker.internet.userName(),
                name: faker.internet.email(),
                password: faker.internet.password(),
              },
            },
          }),
        )
        .expect(200);
      expect(result.body.data.signUp).toHaveProperty('token');
      await teardown();
    },
  );
});
