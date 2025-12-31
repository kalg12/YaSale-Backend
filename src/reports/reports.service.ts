import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { Check, CheckStatus } from '../entities/check.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Check)
    private readonly checksRepository: Repository<Check>,
  ) {}

  async getDashboard(
    tenantId: string,
    storeId: string,
    query: DashboardQueryDto,
  ) {
    const date = query.date ? new Date(query.date) : new Date();
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const qb = this.checksRepository.createQueryBuilder('check');
    qb.select('SUM(check.total)', 'totalRevenue')
      .addSelect('COUNT(check.id)', 'totalChecks')
      .addSelect('AVG(check.total)', 'averageCheckValue')
      .innerJoin('check.store', 'store')
      .where('store.tenantId = :tenantId', { tenantId })
      .andWhere('check.storeId = :storeId', { storeId })
      .andWhere('check.status = :status', { status: CheckStatus.PAID })
      .andWhere('check.paidAt >= :startDate', { startDate })
      .andWhere('check.paidAt <= :endDate', { endDate });

    const result = await qb.getRawOne();

    return {
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      totalChecks: parseInt(result.totalChecks) || 0,
      averageCheckValue: parseFloat(result.averageCheckValue) || 0,
    };
  }

  async getSalesReport(tenantId: string, query: SalesReportQueryDto) {
    const { from, to, storeId } = query;
    const startDate = startOfDay(new Date(from));
    const endDate = endOfDay(new Date(to));

    const qb = this.checksRepository.createQueryBuilder('check');
    qb.select('check.storeId', 'storeId')
      .addSelect('SUM(check.total)', 'total')
      .addSelect('SUM(check.subtotal)', 'subtotal')
      .addSelect('SUM(check.tip)', 'tip')
      .addSelect('COUNT(check.id)', 'count')
      .innerJoin('check.store', 'store')
      .where('store.tenantId = :tenantId', { tenantId })
      .andWhere('check.status = :status', { status: CheckStatus.PAID })
      .andWhere('check.paidAt >= :startDate', { startDate })
      .andWhere('check.paidAt <= :endDate', { endDate });

    if (storeId) {
      qb.andWhere('check.storeId = :storeId', { storeId });
    }

    qb.groupBy('check.storeId');

    return qb.getRawMany();
  }
}
