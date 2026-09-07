import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Extracts the logged-in user's id from the session. Only use on routes
 * behind @UseGuards(AuthGuard) — the guard is what actually rejects
 * unauthenticated requests; this decorator just reads what it verified.
 */
export const CurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.session.userId!;
  },
);
