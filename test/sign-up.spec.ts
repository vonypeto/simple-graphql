import fixtures from './fixtures';

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
                email: 'johndoe@getnada.com',
                name: 'john doe',
                password: '123',
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
