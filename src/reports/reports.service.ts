import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { Check, CheckStatus } from '../entities/check.entity';
import { TipLog } from '../entities/tip-log.entity';
import { TipsQueryDto } from './dto/tips-query.dto';

/* These interfaces, `DashboardRawResult` and `TipsRawResult`, are defining the structure of the raw
results that will be returned from database queries in the `ReportsService` class. */
interface DashboardRawResult {
  totalRevenue: string | null;
  totalChecks: string | null;
  averageCheckValue: string | null;
}

interface TipsRawResult {
  totalTips: string | null;
}

/* The ReportsService class in TypeScript provides methods for generating dashboard data, sales
reports, and tips history based on specified criteria. */
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Check)
    private readonly checksRepository: Repository<Check>,
    @InjectRepository(TipLog)
    private readonly tipLogsRepository: Repository<TipLog>,
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

    const result = await qb.getRawOne<DashboardRawResult>();

    const tipsResult = await this.tipLogsRepository
      .createQueryBuilder('tip')
      .select('SUM(tip.amount)', 'totalTips')
      .where('tip.tenantId = :tenantId', { tenantId })
      .andWhere('tip.storeId = :storeId', { storeId })
      .andWhere('tip.createdAt >= :startDate', { startDate })
      .andWhere('tip.createdAt <= :endDate', { endDate })
      // 3. CORRECCIÓN: Tipamos también este resultado
      .getRawOne<TipsRawResult>();

    return {
      totalRevenue: parseFloat(result?.totalRevenue ?? '0'),
      totalChecks: parseInt(result?.totalChecks ?? '0', 10),
      averageCheckValue: parseFloat(result?.averageCheckValue ?? '0'),
      totalTips: parseFloat(tipsResult?.totalTips ?? '0'),
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

  async getTipsHistory(
    tenantId: string,
    query: TipsQueryDto,
  ): Promise<TipLog[]> {
    const qb = this.tipLogsRepository.createQueryBuilder('tip');
    qb.where('tip.tenantId = :tenantId', { tenantId });

    if (query.storeId) {
      qb.andWhere('tip.storeId = :storeId', { storeId: query.storeId });
    }
    if (query.userId) {
      qb.andWhere('tip.userId = :userId', { userId: query.userId });
    }
    if (query.from) {
      qb.andWhere('tip.createdAt >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('tip.createdAt <= :to', { to: new Date(query.to) });
    }

    qb.orderBy('tip.createdAt', 'DESC');

    return qb.getMany();
  }
}
