import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignUpDto } from './dto/sign-up.dto.js';

// Cost factor for bcrypt. 10 is the library's own recommended default
// (~10 hashes/sec on modern hardware) — high enough to resist brute
// force, low enough not to make signup noticeably slow.
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(dto: SignUpDto): Promise<UserResponseDto> {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      username: dto.username,
      passwordHash,
      nickname: dto.nickname,
    });

    return this.toUserResponse(user);
  }

  /**
   * Returns the raw entity, not a response DTO — the controller still
   * needs `user.id` to write it into the session, so serialization
   * happens one level up (see AuthController.login).
   */
  async login(dto: LoginDto): Promise<User> {
    const user = await this.validateCredentials(dto.username, dto.password);
    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }
    return user;
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      // The session was valid but the account behind it is gone.
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return this.toUserResponse(user);
  }

  /**
   * Same error for "no such user" and "wrong password" — telling them
   * apart lets an attacker enumerate valid usernames.
   */
  private async validateCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  toUserResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
