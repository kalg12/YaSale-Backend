import {
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  Length,
} from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @Length(4, 8)
  pin: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  storeIds: string[];
}
