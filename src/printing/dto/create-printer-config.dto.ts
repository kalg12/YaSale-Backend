import { IsBoolean, IsIP, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreatePrinterConfigDto {
  @IsString()
  name: string;

  @IsIP()
  ipAddress: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsUUID()
  storeId: string;
}
