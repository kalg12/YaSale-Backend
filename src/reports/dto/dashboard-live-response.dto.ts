import { ApiProperty } from '@nestjs/swagger';

export class DashboardLiveResponseDto {
  @ApiProperty()
  activeOrdersCount: number;

  @ApiProperty()
  readyOrdersCount: number;

  @ApiProperty()
  openChecksCount: number;

  @ApiProperty()
  salesTodayTotal: number;

  @ApiProperty()
  tipsTodayTotal: number;

  @ApiProperty()
  avgTicketToday: number;

  @ApiProperty({ description: 'Optional top 5 products by quantity sold today', type: 'array', required: false })
  topProductsToday?: Array<{
    productId: string;
    name: string;
    quantity: number;
  }>;
}
