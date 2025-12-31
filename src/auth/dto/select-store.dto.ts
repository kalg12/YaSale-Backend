import { IsUUID } from 'class-validator';

export class SelectStoreDto {
  @IsUUID()
  storeId: string;
}
