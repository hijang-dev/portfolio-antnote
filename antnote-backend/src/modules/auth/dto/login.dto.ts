import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'antnote_user' })
  @IsString()
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  username!: string;

  @ApiProperty({ example: 'antnote1234' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password!: string;
}
