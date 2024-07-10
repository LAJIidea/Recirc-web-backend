import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Sandbox } from "../sandbox/sandbox.entity";
import { UsersToSandboxes } from "./usersToSandboxes.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({nullable: true})
  image: string;

  @Column({default: 0})
  generations: number;

  @OneToMany(() => Sandbox, (sandbox) => sandbox.user)
  sandboxes: Sandbox[];

  @OneToMany(() => UsersToSandboxes, (uts) => uts.user)
  usersToSandboxes: UsersToSandboxes[];
}