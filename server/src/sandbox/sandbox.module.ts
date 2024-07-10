import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sandbox } from './sandbox.entity';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sandbox])],
  providers: [SandboxService],
  exports: [SandboxService],
  controllers: [SandboxController],
})
export class SandboxModule {}
