import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { User } from "../user/user.entity";
import { UsersToSandboxes } from "../user/usersToSandboxes.entity";

@Entity()
export class Sandbox {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({nullable: true})
  visibility: string;

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sandboxes)
  user: User;

  @OneToMany(() => UsersToSandboxes, (uts) => uts.sandbox)
  usersToSandboxes: UsersToSandboxes[];
}