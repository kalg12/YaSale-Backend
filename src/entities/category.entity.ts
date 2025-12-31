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
import { Product } from './product.entity';

@Entity('categories')
@Index(['tenantId'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  tenantId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.categories, {
    onDelete: 'CASCADE',
  })
  tenant: Tenant;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
