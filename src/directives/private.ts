import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GqlExecutionContext } from '@nestjs/graphql';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { HttpException, HttpStatus } from '@nestjs/common';

export function privateDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const privateDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      // directive
      if (privateDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        // Replace the original resolver with a function that first performs the authorization check
        // and then calls the original resolver
        fieldConfig.resolve = async function (source, args, context, info) {
          // const gqlContext = GqlExecutionContext.create(context);
          // const isAuthorized = await performAuthorizationCheck(gqlContext); // Implement your authorization logic here

          if (!context.req.claims) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }

          return resolve(source, args, context, info);
        };

        return fieldConfig;
      }

      return fieldConfig; // Return the fieldConfig without modifying the resolver
    },
  });
}
