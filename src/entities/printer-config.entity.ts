import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';

@Entity('printer_configs')
@Index(['storeId'])
export class PrinterConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  ipAddress: string;

  @Column({ default: 9100 })
  port: number;

  @Column({ default: true })
  isEnabled: boolean;

  @Column()
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.printerConfigs, {
    onDelete: 'CASCADE',
  })
  store: Store;
}
