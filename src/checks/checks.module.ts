import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecksController } from './checks.controller';
import { ChecksService } from './checks.service';
import { Check } from '../entities/check.entity';
import { CheckOrder } from '../entities/check-order.entity';
import { Order } from '../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Check, CheckOrder, Order])],
  controllers: [ChecksController],
  providers: [ChecksService],
})
export class ChecksModule {}
