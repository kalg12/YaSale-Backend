import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Check } from './check.entity';
import { Order } from './order.entity';

@Entity('check_orders')
@Index(['checkId'])
@Index(['orderId'])
export class CheckOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  checkId: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Check, (check) => check.orders, {
    onDelete: 'CASCADE',
  })
  check: Check;

  @ManyToOne(() => Order, (order) => order.checks, {
    onDelete: 'CASCADE',
  })
  order: Order;
}
