import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Store } from './store.entity';
import { Order } from './order.entity';
import { Check } from './check.entity';
import { UserStore } from './user-store.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  KITCHEN = 'KITCHEN',
  WAITER = 'WAITER',
  CASHIER = 'CASHIER',
}

@Entity('users')
@Index(['tenantId'])
@Unique(['tenantId', 'pin'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  pin: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.WAITER,
  })
  role: UserRole;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  activeStoreId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, {
    onDelete: 'CASCADE',
  })
  tenant: Tenant;

  @ManyToOne(() => Store, { nullable: true })
  activeStore?: Store;

  @OneToMany(() => UserStore, (userStore) => userStore.user)
  stores: UserStore[];

  @OneToMany(() => Order, (order) => order.waiter)
  orders: Order[];

  @OneToMany(() => Check, (check) => check.waiter)
  checks: Check[];
}
