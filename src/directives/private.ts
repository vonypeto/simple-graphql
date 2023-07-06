import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GqlExecutionContext } from '@nestjs/graphql';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function privateDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          // bearer authorization validation

          console.log('private called here', context.req?.claims);

          // create-product @private
          return resolve(source, args, context, info);
        };
        return fieldConfig;
      }
    },
  });
}
