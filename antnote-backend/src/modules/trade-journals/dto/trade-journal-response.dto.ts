import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Same whitelist pattern as TermResponseDto/UserResponseDto — userId
 * excluded on purpose.
 */
export class TradeJournalResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  stockName!: string;

  @ApiProperty()
  @Expose()
  rationale!: string;

  @ApiProperty({ nullable: true, type: String })
  @Expose()
  review!: string | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
