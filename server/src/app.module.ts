import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from "./app.gateway";
import { MinioModule } from "./minio.module";

@Module({
  imports: [MinioModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
