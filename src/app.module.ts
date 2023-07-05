import { config } from 'dotenv';
config();
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver } from '@nestjs/apollo';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLContextMiddleware } from './middleware/authorization';
import { CorsMiddleware } from './middleware/cors';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AccountsModule } from './resolver/accounts/accounts.module';
import { DatabaseModule } from './configs/mongoose.db';
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env', // Path to your environment file
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: [
        join(process.cwd(), 'schema/account.schema.graphql'),
        join(process.cwd(), 'schema/product.schema.graphql'), // Add the path to the product schema file
      ], // Provide the path to the schema file
      driver: ApolloDriver,
    }),
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: BasicAuthInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, GraphQLContextMiddleware).forRoutes('*');
  }
}
