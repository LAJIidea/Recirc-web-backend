import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { Sandbox } from './sandbox.entity';

@Controller('sandboxes')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Get()
  findAll(): Promise<Sandbox[]> {
    return this.sandboxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Sandbox> {
    return this.sandboxService.findOne(id);
  }

  @Post()
  create(@Body() sandbox: Partial<Sandbox>): Promise<Sandbox> {
    return this.sandboxService.create(sandbox);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.sandboxService.remove(id);
  }
}