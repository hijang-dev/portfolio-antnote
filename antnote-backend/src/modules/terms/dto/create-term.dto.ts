import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CreateTermDto {
  @ApiProperty({
    example: 'PER',
    minLength: 1,
    maxLength: 50,
    description: '용어',
  })
  @Length(1, 50, { message: '용어는 1자 이상 50자 이하로 입력해주세요.' })
  term!: string;

  @ApiProperty({
    example:
      '주가를 주당순이익으로 나눈 값. 낮을수록 저평가된 것으로 볼 수 있다.',
    minLength: 1,
    maxLength: 1000,
    description: '정의',
  })
  @Length(1, 1000, { message: '정의는 1자 이상 1000자 이하로 입력해주세요.' })
  definition!: string;
}
