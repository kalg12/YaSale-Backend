import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard/:storeId')
  @ApiOperation({ summary: 'Get dashboard metrics for a store' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  getDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.reportsService.getDashboard(user.tenantId, storeId, query);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get an aggregated sales report' })
  getSalesReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SalesReportQueryDto,
  ) {
    return this.reportsService.getSalesReport(user.tenantId, query);
  }
}
