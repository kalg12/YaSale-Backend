import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateVariantOptionDto {
  @IsString()
  name: string;

  @IsUUID()
  variantGroupId: string;

  @IsNumber()
  @Min(0)
  priceDelta: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}
