import { ApiProperty } from '@nestjs/swagger';

export class PinLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwi...',
  })
  accessToken: string;
}
