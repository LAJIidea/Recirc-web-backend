import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find({relations: ['sandboxes', 'usersToSandboxes']});
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ relations: ['sandboxes', 'usersToSandboxes'], where: { id } });
  }

  create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

}