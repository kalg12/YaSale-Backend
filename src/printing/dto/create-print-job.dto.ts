import { IsOptional, IsUUID } from 'class-validator';

export class CreatePrintJobDto {
  @IsUUID()
  @IsOptional()
  storeId?: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsUUID()
  @IsOptional()
  printerConfigId?: string;

  @IsOptional()
  payload?: Record<string, any>;
}
