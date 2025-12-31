import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Check } from '../entities/check.entity';
import { TipLog } from '../entities/tip-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Check, TipLog])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
