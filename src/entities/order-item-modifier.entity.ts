import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum ModifierType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

@Entity('order_item_modifiers')
@Index(['orderItemId'])
export class OrderItemModifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderItemId: string;

  @Column()
  modifierId: string;

  @Column({
    type: 'enum',
    enum: ModifierType,
  })
  type: ModifierType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.modifiers, {
    onDelete: 'CASCADE',
  })
  orderItem: OrderItem;
}
