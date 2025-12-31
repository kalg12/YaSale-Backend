import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ProductModifierGroup } from './product-modifier-group.entity';

@Entity('product_modifier_options')
@Index(['modifierGroupId'])
export class ProductModifierOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceDelta: number;

  @Column()
  modifierGroupId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ProductModifierGroup,
    (modifierGroup) => modifierGroup.options,
    { onDelete: 'CASCADE' },
  )
  modifierGroup: ProductModifierGroup;
}
