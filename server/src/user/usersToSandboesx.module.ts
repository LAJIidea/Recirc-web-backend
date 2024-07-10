import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersToSandboxes } from './usersToSandboxes.entity';
import { UsersToSandboxesService } from './usersToSandboxes.service';
import { UsersToSandboxesController } from './usersToSandboxes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsersToSandboxes])],
  providers: [UsersToSandboxesService],
  exports: [UsersToSandboxesService],
  controllers: [UsersToSandboxesController],
})
export class UsersToSandboxesModule {}
