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
import { Category } from './category.entity';
import { Store } from './store.entity';
import { ProductVariantGroup } from './product-variant-group.entity';
import { ProductModifierGroup } from './product-modifier-group.entity';
import { OrderItem } from './order-item.entity';

@Entity('products')
@Index(['categoryId'])
@Index(['storeId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column()
  categoryId: string;

  @Column()
  storeId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToOne(() => Store, (store) => store.products, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => ProductVariantGroup, (group) => group.product, {
    cascade: true,
  })
  variantGroups: ProductVariantGroup[];

  @OneToMany(() => ProductModifierGroup, (group) => group.product, {
    cascade: true,
  })
  modifierGroups: ProductModifierGroup[];
}
