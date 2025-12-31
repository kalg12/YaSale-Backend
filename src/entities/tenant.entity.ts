import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Store } from './store.entity';
import { Category } from './category.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ default: 'STARTER' })
  subscriptionPlan: string;

  @Column({ default: 'TRIALING' })
  subscriptionStatus: string;

  @Column({ nullable: true })
  trialEndsAt: Date;

  @Column({ default: 1 })
  maxStores: number;

  @Column({ default: 3 })
  maxUsers: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Store, (store) => store.tenant)
  stores: Store[];

  @OneToMany(() => Category, (category) => category.tenant)
  categories: Category[];
}
