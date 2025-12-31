import { IsString, Length } from 'class-validator';

export class PinLoginDto {
  @IsString()
  tenantId: string;

  @IsString()
  @Length(4, 8)
  pin: string;
}
