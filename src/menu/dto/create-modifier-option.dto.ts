import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ModifierType } from '../../entities/order-item-modifier.entity';

export class CreateModifierOptionDto {
  @IsString()
  name: string;

  @IsUUID()
  modifierGroupId: string;

  @IsEnum(ModifierType)
  @IsOptional()
  type?: ModifierType;

  @IsNumber()
  @IsOptional()
  priceDelta?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}
