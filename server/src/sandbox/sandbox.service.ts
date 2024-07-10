import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sandbox } from './sandbox.entity';

@Injectable()
export class SandboxService {
  constructor(
    @InjectRepository(Sandbox)
    private sandboxRepository: Repository<Sandbox>,
  ) {}

  findAll(): Promise<Sandbox[]> {
    return this.sandboxRepository.find({ relations: ['user', 'usersToSandboxes'] });
  }

  findOne(id: string): Promise<Sandbox> {
    return this.sandboxRepository.findOne({where: {id}, relations: ['user', 'usersToSandboxes']});
  }

  create(sandbox: Partial<Sandbox>): Promise<Sandbox> {
    const newSandbox = this.sandboxRepository.create(sandbox);
    return this.sandboxRepository.save(newSandbox);
  }

  async remove(id: string): Promise<void> {
    await this.sandboxRepository.delete(id);
  }
}