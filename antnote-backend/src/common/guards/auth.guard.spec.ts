import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth.guard.js';

function contextWithHeaders(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let jwtService: { verifyAsync: ReturnType<typeof vi.fn> };
  let guard: AuthGuard;

  beforeEach(() => {
    jwtService = { verifyAsync: vi.fn() };
    guard = new AuthGuard(jwtService as unknown as JwtService);
  });

  it('rejects a request with no Authorization header', async () => {
    await expect(
      guard.canActivate(contextWithHeaders({})),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    await expect(
      guard.canActivate(contextWithHeaders({ authorization: 'Basic abc123' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an invalid/expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(
        contextWithHeaders({ authorization: 'Bearer bad.token' }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows a valid token through and attaches the payload to the request', async () => {
    const payload = { sub: 'user-1', username: 'antnote_user' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: 'Bearer good.token' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(payload);
  });
});
