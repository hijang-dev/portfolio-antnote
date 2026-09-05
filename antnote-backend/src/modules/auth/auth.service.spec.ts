import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignUpDto } from './dto/sign-up.dto.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    findByUsername: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const signUpDto: SignUpDto = {
    username: 'antnote_user',
    password: 'antnote1234',
    nickname: '앤트노트',
  };

  const existingUser = {
    id: 'a5f2b6a0-0000-4000-8000-000000000000',
    username: 'antnote_user',
    nickname: '앤트노트',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('signUp', () => {
    it('creates a user with a bcrypt-hashed password and no plaintext password in the response', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockImplementation(async (input) => ({
        ...existingUser,
        username: input.username,
        password: input.passwordHash,
        nickname: input.nickname,
      }));

      const result = await authService.signUp(signUpDto);

      expect(usersService.create).toHaveBeenCalledTimes(1);
      const passwordHash = usersService.create.mock.calls[0][0].passwordHash;
      expect(passwordHash).not.toBe(signUpDto.password);
      expect(passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format

      expect(result).toMatchObject({
        username: signUpDto.username,
        nickname: signUpDto.nickname,
      });
      expect(
        (result as unknown as Record<string, unknown>).password,
      ).toBeUndefined();
    });

    it('rejects a duplicate username with ConflictException', async () => {
      usersService.findByUsername.mockResolvedValue({ id: 'existing' });

      await expect(authService.signUp(signUpDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'antnote_user',
      password: 'antnote1234',
    };

    it('returns the user entity when the password matches', async () => {
      const passwordHash = await bcrypt.hash(loginDto.password, 4);
      usersService.findByUsername.mockResolvedValue({
        ...existingUser,
        password: passwordHash,
      });

      const result = await authService.login(loginDto);

      expect(result.id).toBe(existingUser.id);
      expect(result.username).toBe(existingUser.username);
    });

    it('rejects a wrong password with UnauthorizedException', async () => {
      const passwordHash = await bcrypt.hash('a-different-password', 4);
      usersService.findByUsername.mockResolvedValue({
        ...existingUser,
        password: passwordHash,
      });

      await expect(authService.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a non-existent username with UnauthorizedException (same error as wrong password)', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('returns the whitelisted user for a valid id', async () => {
      usersService.findById.mockResolvedValue({
        ...existingUser,
        password: 'irrelevant-hash',
      });

      const result = await authService.getCurrentUser(existingUser.id);

      expect(result).toMatchObject({ username: existingUser.username });
      expect(
        (result as unknown as Record<string, unknown>).password,
      ).toBeUndefined();
    });

    it('rejects an id with no matching user with UnauthorizedException', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        authService.getCurrentUser('missing-id'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
