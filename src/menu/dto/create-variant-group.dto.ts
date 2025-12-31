import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateVariantGroupDto {
  @IsString()
  name: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}
