import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { User } from './user.entity';

@Entity('tip_logs')
@Index(['storeId'])
@Index(['userId'])
export class TipLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storeId: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  tenantId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;
}
