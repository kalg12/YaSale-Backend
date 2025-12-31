import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ProductVariantGroup } from './product-variant-group.entity';

@Entity('product_variant_options')
@Index(['variantGroupId'])
export class ProductVariantOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDelta: number;

  @Column()
  variantGroupId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ProductVariantGroup,
    (variantGroup) => variantGroup.options,
    { onDelete: 'CASCADE' },
  )
  variantGroup: ProductVariantGroup;
}
