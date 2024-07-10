import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from "./app.gateway";
import { MinioModule } from "./minio/minio.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typerOrmConfig } from "./config/typeorm.config";
import { UserModule } from "./user/user.module";
import { UsersToSandboxesModule } from "./user/usersToSandboesx.module";
import { SandboxModule } from "./sandbox/sandbox.module";
import { ReactModule } from "./react/react.module";

@Module({
  imports: [
    TypeOrmModule.forRoot(typerOrmConfig),
    MinioModule,
    UserModule,
    SandboxModule,
    UsersToSandboxesModule,
    ReactModule
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
