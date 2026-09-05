import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { Session as ExpressSession, SessionData } from 'express-session';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';

type AppSession = ExpressSession & Partial<SessionData>;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiConflictResponse({ description: '이미 사용 중인 아이디' })
  signUp(@Body() dto: SignUpDto): Promise<UserResponseDto> {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인 (세션 발급)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiUnauthorizedResponse({ description: '아이디 또는 비밀번호 불일치' })
  async login(
    @Body() dto: LoginDto,
    @Session() session: AppSession,
  ): Promise<UserResponseDto> {
    const user = await this.authService.login(dto);
    session.userId = user.id;
    return this.authService.toUserResponse(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃 (세션 파기)' })
  @ApiOkResponse({
    description: '로그아웃 완료 (로그인 상태가 아니었어도 200)',
  })
  async logout(
    @Session() session: AppSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await new Promise<void>((resolve, reject) => {
      session.destroy((err) => (err ? reject(err) : resolve()));
    });
    res.clearCookie('antnote.sid');
    return { message: '로그아웃되었습니다.' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: '내 정보 조회 (로그인 필요)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: '로그인되어 있지 않음' })
  me(@Session() session: AppSession): Promise<UserResponseDto> {
    // Non-null assertion is safe here: AuthGuard already rejected the
    // request (401) if session.userId wasn't set.
    return this.authService.getCurrentUser(session.userId!);
  }
}
