import { AccountService } from '../../src/services/account/account.service';
import fixtures from '../fixtures';
import { faker } from '@faker-js/faker';

describe('Query.me', () => {
  test.concurrent('should return the user data if authenticated', async () => {
    const { app, request, teardown } = await fixtures();
    let accountService: AccountService;

    accountService = app.get(AccountService);
    // Sign up the user first
    const name = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const data = await accountService.register({
      name,
      email,
      password,
    });
    let token = await accountService.generateToken(data.id.toString(), '1d');
    const meResult = await request
      .send(
        JSON.stringify({
          query: `
            query {
              me {
                id
                name
              }
            }
          `,
        }),
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const userData = meResult.body.data.me;
    expect(userData).toEqual({
      id: expect.any(String),
      name,
    });

    await teardown();
  });

  test.concurrent('should throw an error if no token is provided', async () => {
    const { request, teardown } = await fixtures();

    const meResult = await request
      .send(
        JSON.stringify({
          query: `
            query {
              me {
                id
                name
              }
            }
          `,
        }),
      )
      .expect(200);
    expect(meResult.body.errors).toBeDefined();
    expect(meResult.body.errors[0].message).toBe('Unauthorized');

    await teardown();
  });

  test.concurrent('should throw an error if the token is expired', async () => {
    const { app, request, teardown } = await fixtures();
    let accountService: AccountService;

    accountService = app.get(AccountService);
    // Sign up the user first
    const name = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const data = await accountService.register({
      name,
      email,
      password,
    });
    let expiredToken = await accountService.generateToken(
      data.id.toString(),
      '-10s',
    );

    const meResult = await request
      .send(
        JSON.stringify({
          query: `
            query {
              me {
                id
                name
              }
            }
          `,
        }),
      )
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(403);
    expect(meResult.body.message).toBe('JWT token expired');
    expect(meResult.body.code).toBe('JWT_EXPIRED');

    await teardown();
  });
});
