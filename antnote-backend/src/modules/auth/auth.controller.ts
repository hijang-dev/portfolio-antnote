import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';

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
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiUnauthorizedResponse({ description: '아이디 또는 비밀번호 불일치' })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회 (인증 필요)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: '토큰 없음, 유효하지 않음, 만료됨' })
  me(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(request.user.sub);
  }
}
