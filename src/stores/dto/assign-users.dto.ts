import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class AssignUsersDto {
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  userIds: string[];
}
