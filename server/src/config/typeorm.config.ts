import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { UsersToSandboxes } from "../user/usersToSandboxes.entity";
import { Sandbox } from "../sandbox/sandbox.entity";

export const typerOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  // host: '10.3.1.200',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'recirc',
  entities: [User, Sandbox, UsersToSandboxes],
  synchronize: true
}