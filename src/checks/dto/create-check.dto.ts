import { IsOptional, IsUUID } from 'class-validator';

export class CreateCheckDto {
  @IsUUID()
  @IsOptional()
  storeId?: string;
}
