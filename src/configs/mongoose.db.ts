import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './db.config';

@Module({
  imports: [MongooseModule.forRoot(databaseConfig.uri)],
})
export class DatabaseModule {}
