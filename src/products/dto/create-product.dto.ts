import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  storeId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
