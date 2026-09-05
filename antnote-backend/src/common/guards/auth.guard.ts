import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Applied per-route with @UseGuards(AuthGuard), not globally — most routes
 * in this app are still public (signup, health, app info), so opting
 * protected routes in is less noise than opting the rest out.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
