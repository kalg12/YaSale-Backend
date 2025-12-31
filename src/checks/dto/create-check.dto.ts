import { IsUUID } from 'class-validator';

export class CreateCheckDto {
  @IsUUID()
  storeId: string;
}
