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
import { ProductVariantOption } from './product-variant-option.entity';

@Entity('product_variant_groups')
@Index(['productId'])
export class ProductVariantGroup {
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

  @ManyToOne(() => Product, (product) => product.variantGroups, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @OneToMany(() => ProductVariantOption, (option) => option.variantGroup, {
    cascade: true,
  })
  options: ProductVariantOption[];
}
