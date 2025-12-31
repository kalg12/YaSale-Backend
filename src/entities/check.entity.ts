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
import { Store } from './store.entity';
import { User } from './user.entity';
import { CheckOrder } from './check-order.entity';

export enum CheckStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('checks')
@Index(['storeId'])
@Index(['status'])
@Index(['waiterId'])
@Unique(['storeId', 'number'])
export class Check {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column({
    type: 'enum',
    enum: CheckStatus,
    default: CheckStatus.OPEN,
  })
  status: CheckStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column()
  storeId: string;

  @Column()
  waiterId: string;

  @Column({ nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.checks, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @ManyToOne(() => User, (user) => user.checks)
  waiter: User;

  @OneToMany(() => CheckOrder, (checkOrder) => checkOrder.check)
  orders: CheckOrder[];
}
