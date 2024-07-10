import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersToSandboxes } from './usersToSandboxes.entity';

@Injectable()
export class UsersToSandboxesService {
  constructor(
    @InjectRepository(UsersToSandboxes)
    private utsRepository: Repository<UsersToSandboxes>,
  ) {}

  create(uts: Partial<UsersToSandboxes>): Promise<UsersToSandboxes> {
    const newUts = this.utsRepository.create(uts);
    return this.utsRepository.save(newUts);
  }

  async remove(userId: string, sandboxId: string): Promise<void> {
    await this.utsRepository.delete({ userId, sandboxId });
  }
}