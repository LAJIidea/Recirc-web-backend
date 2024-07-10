import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from "./app.gateway";
import { MinioModule } from "./minio/minio.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typerOrmConfig } from "./config/typeorm.config";

@Module({
  imports: [
    TypeOrmModule.forRoot(typerOrmConfig),
    MinioModule
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
