import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { SignUpDto } from './dto/sign-up.dto.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findByUsername: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  const signUpDto: SignUpDto = {
    username: 'antnote_user',
    password: 'antnote1234',
    nickname: '앤트노트',
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: vi.fn(),
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: UsersService, useValue: usersService }],
    }).compile();

    authService = module.get(AuthService);
  });

  it('creates a user with a bcrypt-hashed password and no plaintext password in the response', async () => {
    usersService.findByUsername.mockResolvedValue(null);
    usersService.create.mockImplementation(async (input) => ({
      id: 'a5f2b6a0-0000-4000-8000-000000000000',
      username: input.username,
      password: input.passwordHash,
      nickname: input.nickname,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await authService.signUp(signUpDto);

    expect(usersService.create).toHaveBeenCalledTimes(1);
    const passwordHash = usersService.create.mock.calls[0][0].passwordHash;
    expect(passwordHash).not.toBe(signUpDto.password);
    expect(passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format

    expect(result).toMatchObject({ username: signUpDto.username, nickname: signUpDto.nickname });
    expect((result as unknown as Record<string, unknown>).password).toBeUndefined();
  });

  it('rejects a duplicate username with ConflictException', async () => {
    usersService.findByUsername.mockResolvedValue({ id: 'existing' });

    await expect(authService.signUp(signUpDto)).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });
});
