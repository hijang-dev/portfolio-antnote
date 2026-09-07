import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Same whitelist pattern as UserResponseDto — userId is deliberately left
 * out. The client already knows "these are my terms" from the fact that
 * it's calling its own authenticated /terms endpoints; echoing userId
 * back adds nothing and is one more internal id to leak.
 */
export class TermResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  term!: string;

  @ApiProperty()
  @Expose()
  definition!: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
