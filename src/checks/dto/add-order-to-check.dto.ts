import { IsUUID } from 'class-validator';

export class AddOrderToCheckDto {
  @IsUUID()
  orderId: string;
}
