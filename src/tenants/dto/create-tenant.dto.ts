import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxStores?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxUsers?: number;
}
