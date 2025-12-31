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
import { OrderItem } from './order-item.entity';
import { CheckOrder } from './check-order.entity';

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TO_GO = 'TO_GO',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
@Index(['storeId'])
@Index(['status'])
@Index(['waiterId'])
@Unique(['storeId', 'number'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ nullable: true })
  tableNumber: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  storeId: string;

  @Column()
  waiterId: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  readyAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.orders, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @ManyToOne(() => User, (user) => user.orders)
  waiter: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => CheckOrder, (checkOrder) => checkOrder.order)
  checks: CheckOrder[];
}
