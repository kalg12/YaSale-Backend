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
import { PrinterConfig } from './printer-config.entity';
import { PrintJob } from './print-job.entity';
import { TipLog } from './tip-log.entity';

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

  @OneToMany(() => PrinterConfig, (printer) => printer.store)
  printerConfigs: PrinterConfig[];

  @OneToMany(() => PrintJob, (job) => job.store)
  printJobs: PrintJob[];

  @OneToMany(() => TipLog, (tipLog) => tipLog.store)
  tipLogs: TipLog[];
}
