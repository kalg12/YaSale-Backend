import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class SalesReportQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;
}
