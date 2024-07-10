import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Sandbox } from "../sandbox/sandbox.entity";

@Entity()
export class UsersToSandboxes {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() =>User, (user) => user.usersToSandboxes)
  @JoinColumn({ name: 'userId' }) // 指定 userId 列作为外键
  user: User;

  @ManyToOne(() => Sandbox, (sandbox) => sandbox.usersToSandboxes)
  @JoinColumn({ name: 'sandboxId' }) // 指定 sandboxId 列作为外键
  sandbox: Sandbox;

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  sharedOn: Date;

  @Column()
  userId: string;

  @Column()
  sandboxId: string;
}