import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class CreateTradeJournalDto {
  @ApiProperty({ example: '삼성전자 단기 매매', minLength: 1, maxLength: 100 })
  @Length(1, 100, { message: '제목은 1자 이상 100자 이하로 입력해주세요.' })
  title!: string;

  @ApiProperty({
    example: '삼성전자',
    minLength: 1,
    maxLength: 100,
    description: '매매종목',
  })
  @Length(1, 100, { message: '매매종목은 1자 이상 100자 이하로 입력해주세요.' })
  stockName!: string;

  @ApiProperty({
    example: '<p>실적 발표를 앞두고 반도체 업황 개선 기대감으로 매수</p>',
    description: '매매근거 (에디터 HTML)',
  })
  @Length(1, 20000, { message: '매매근거를 입력해주세요.' })
  rationale!: string;

  @ApiPropertyOptional({
    example: '<p>목표가 도달 전 조기 매도, 다음엔 더 기다려볼 것</p>',
    description: '매매복기 (에디터 HTML) — 나중에 작성해도 됨',
  })
  @IsOptional()
  @Length(0, 20000)
  review?: string;
}
