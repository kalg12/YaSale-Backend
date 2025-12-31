import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrintingController } from './printing.controller';
import { PrintingService } from './printing.service';
import { PrinterConfig } from '../entities/printer-config.entity';
import { PrintJob } from '../entities/print-job.entity';
import { Store } from '../entities/store.entity';
import { Order } from '../entities/order.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrinterConfig, PrintJob, Store, Order]),
    RabbitMQModule,
  ],
  controllers: [PrintingController],
  providers: [PrintingService],
  exports: [PrintingService],
})
export class PrintingModule {}
