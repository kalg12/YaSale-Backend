import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Check } from '../entities/check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Check])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
