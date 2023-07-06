import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import {
  defaultFieldResolver,
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';

export function privateDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (type: GraphQLObjectType) => {
      const fields = type.getFields();
      Object.values(fields).forEach((field) => {
        const privateDirective = getDirective(
          schema,
          field,
          directiveName,
        )?.[0];
        if (privateDirective) {
          const { resolve = defaultFieldResolver } = field;
          field.resolve = async function (source, args, context, info) {
            // Perform bearer authorization validation here

            return resolve(source, args, context, info);
          };
        }
      });
      return type;
    },
  });
}
