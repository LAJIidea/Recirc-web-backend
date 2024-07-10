import { Controller, Post, Delete, Body } from '@nestjs/common';
import { UsersToSandboxesService } from './usersToSandboxes.service';
import { UsersToSandboxes } from './usersToSandboxes.entity';

@Controller('users-to-sandboxes')
export class UsersToSandboxesController {
  constructor(private readonly utsService: UsersToSandboxesService) {}

  @Post()
  create(@Body() uts: Partial<UsersToSandboxes>): Promise<UsersToSandboxes> {
    return this.utsService.create(uts);
  }

  @Delete()
  remove(@Body() body: { userId: string; sandboxId: string }): Promise<void> {
    const { userId, sandboxId } = body;
    return this.utsService.remove(userId, sandboxId);
  }
}