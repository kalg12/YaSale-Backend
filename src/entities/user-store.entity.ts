import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Store } from './store.entity';

@Entity('user_stores')
@Index(['userId'])
@Index(['storeId'])
export class UserStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.stores, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Store, (store) => store.users, {
    onDelete: 'CASCADE',
  })
  store: Store;
}
