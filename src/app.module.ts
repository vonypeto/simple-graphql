import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as path from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { APP_GUARD } from '@nestjs/core';
// import { AuthGuard } from './middleware/authorization';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountResolver } from './resolvers/accounts.resolver';
import { QueryResolver } from './resolvers/query.resolver';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from './services/account/account.module';
import { privateDirectiveTransformer } from './directives/private';
import { AuthorizationMiddleware } from './middleware/authorization';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // Path to your environment file
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get('MONGODB_URI'),
        };
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('SECRET_KEY'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => {
        return {
          typePaths: [path.resolve(__dirname, './schema/*.graphql')],
          transformSchema: (schema) =>
            privateDirectiveTransformer(schema, 'private'),
        };
      },
    }),
    AccountModule,
  ],
  providers: [
    AccountResolver,
    QueryResolver,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}
