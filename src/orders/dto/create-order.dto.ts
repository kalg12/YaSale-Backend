import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../entities/order.entity';

export class SelectedVariantDto {
  @IsUUID()
  variantGroupId: string;

  @IsUUID()
  optionId: string;
}

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedVariantDto)
  @IsOptional()
  selectedVariants?: SelectedVariantDto[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  modifierIds?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @IsUUID()
  storeId: string;

  @IsEnum(OrderType)
  type: OrderType;

  @IsString()
  @IsOptional()
  tableNumber?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
