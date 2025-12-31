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
import { PrinterConfig } from './printer-config.entity';

export enum PrintJobStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('print_jobs')
@Index(['storeId'])
@Index(['status'])
export class PrintJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storeId: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  printerConfigId?: string;

  @Column({ type: 'enum', enum: PrintJobStatus, default: PrintJobStatus.QUEUED })
  status: PrintJobStatus;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'json', nullable: true })
  payload?: object;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.printJobs, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @ManyToOne(() => PrinterConfig, { nullable: true, onDelete: 'SET NULL' })
  printerConfig?: PrinterConfig;
}
