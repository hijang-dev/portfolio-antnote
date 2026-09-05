import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Explicit allow-list for anything a User entity is allowed to expose
 * over the API. Built via `plainToInstance(UserResponseDto, user, {
 * excludeExtraneousValues: true })` so a new sensitive column added to
 * the entity later (e.g. a future `refreshToken`) never leaks by default
 * — it has to be added here on purpose first.
 */
export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  nickname: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
