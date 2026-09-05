import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthGuard } from './auth.guard.js';

function contextWithSession(
  session: Record<string, unknown> | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ session }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const guard = new AuthGuard();

  it('rejects a request with no session', () => {
    expect(() => guard.canActivate(contextWithSession(undefined))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a session with no userId (never logged in)', () => {
    expect(() => guard.canActivate(contextWithSession({}))).toThrow(
      UnauthorizedException,
    );
  });

  it('allows a session with a userId through', () => {
    expect(guard.canActivate(contextWithSession({ userId: 'user-1' }))).toBe(
      true,
    );
  });
});
