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
import { Product } from './product.entity';
import { ProductModifierOption } from './product-modifier-option.entity';

@Entity('product_modifier_groups')
@Index(['productId'])
export class ProductModifierGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  productId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.modifierGroups, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => ProductModifierOption, (option) => option.modifierGroup, {
    cascade: true,
  })
  options: ProductModifierOption[];
}
