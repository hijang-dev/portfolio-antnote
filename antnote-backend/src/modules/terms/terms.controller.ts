import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CreateTermDto } from './dto/create-term.dto.js';
import { RandomTermsQueryDto } from './dto/random-terms-query.dto.js';
import { TermResponseDto } from './dto/term-response.dto.js';
import { UpdateTermDto } from './dto/update-term.dto.js';
import { TermsService } from './terms.service.js';

@ApiTags('terms')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: '로그인되어 있지 않음' })
@UseGuards(AuthGuard)
@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '용어 등록' })
  @ApiCreatedResponse({ type: TermResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiConflictResponse({ description: '이미 등록한 용어' })
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateTermDto,
  ): Promise<TermResponseDto> {
    return this.termsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '내가 등록한 용어 목록 (최신순)' })
  @ApiOkResponse({ type: TermResponseDto, isArray: true })
  findAll(@CurrentUserId() userId: string): Promise<TermResponseDto[]> {
    return this.termsService.findAll(userId);
  }

  @Get('random')
  @ApiOperation({ summary: '대시보드 복습용 랜덤 용어 카드' })
  @ApiOkResponse({ type: TermResponseDto, isArray: true })
  findRandom(
    @CurrentUserId() userId: string,
    @Query() query: RandomTermsQueryDto,
  ): Promise<TermResponseDto[]> {
    return this.termsService.findRandom(userId, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '용어 상세 조회' })
  @ApiOkResponse({ type: TermResponseDto })
  @ApiNotFoundResponse({ description: '존재하지 않거나 내 용어가 아님' })
  findOne(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<TermResponseDto> {
    return this.termsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '용어 수정' })
  @ApiOkResponse({ type: TermResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiNotFoundResponse({ description: '존재하지 않거나 내 용어가 아님' })
  @ApiConflictResponse({
    description: '변경하려는 이름이 이미 등록한 다른 용어와 중복',
  })
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    return this.termsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '용어 삭제' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: '존재하지 않거나 내 용어가 아님' })
  remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.termsService.remove(userId, id);
  }
}
