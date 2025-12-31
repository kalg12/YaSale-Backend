import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { UserStore } from './user-store.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { Check } from './check.entity';

@Entity('stores')
@Index(['tenantId'])
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.stores, {
    onDelete: 'CASCADE',
  })
  tenant: Tenant;

  @OneToMany(() => UserStore, (userStore) => userStore.store)
  users: UserStore[];

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @OneToMany(() => Check, (check) => check.store)
  checks: Check[];
}
