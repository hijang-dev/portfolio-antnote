import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * Applied per-route with @UseGuards(AuthGuard), not globally — most routes
 * in this app are still public (signup, login, health, app info), so
 * opting protected routes in is less noise than opting the rest out.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.session?.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    return true;
  }
}
