import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'antnote_user', minLength: 4, maxLength: 20 })
  @IsString()
  @Length(4, 20, { message: '아이디는 4자 이상 20자 이하로 입력해주세요.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.',
  })
  username: string;

  @ApiProperty({ example: 'antnote1234', minLength: 8, maxLength: 64 })
  @IsString()
  @Length(8, 64, { message: '비밀번호는 8자 이상 64자 이하로 입력해주세요.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({ example: '앤트노트', minLength: 2, maxLength: 20 })
  @IsString()
  @Length(2, 20, { message: '닉네임은 2자 이상 20자 이하로 입력해주세요.' })
  nickname: string;
}
