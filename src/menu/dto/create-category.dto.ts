import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}
