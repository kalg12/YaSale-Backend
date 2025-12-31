import { IsNumber, IsOptional, Min } from 'class-validator';

export class CloseCheckDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  tip?: number;
}
