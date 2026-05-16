import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017'),
        dbName: config.get<string>('MONGODB_DB', 'nlp-flow-builder'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
