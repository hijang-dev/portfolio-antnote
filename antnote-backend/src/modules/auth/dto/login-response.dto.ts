import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Bearer 토큰 (Authorization 헤더에 사용)' })
  accessToken!: string;
}
