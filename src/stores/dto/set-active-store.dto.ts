import { IsUUID } from 'class-validator';

export class SetActiveStoreDto {
  @IsUUID()
  storeId: string;
}
