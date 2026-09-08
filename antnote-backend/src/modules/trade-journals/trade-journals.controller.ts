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
import { CreateTradeJournalDto } from './dto/create-trade-journal.dto.js';
import { PendingReviewQueryDto } from './dto/pending-review-query.dto.js';
import { TradeJournalResponseDto } from './dto/trade-journal-response.dto.js';
import { UpdateTradeJournalDto } from './dto/update-trade-journal.dto.js';
import { TradeJournalsService } from './trade-journals.service.js';

@ApiTags('trade-journals')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: '로그인되어 있지 않음' })
@UseGuards(AuthGuard)
@Controller('trade-journals')
export class TradeJournalsController {
  constructor(private readonly journalsService: TradeJournalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '매매일지 작성' })
  @ApiCreatedResponse({ type: TradeJournalResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateTradeJournalDto,
  ): Promise<TradeJournalResponseDto> {
    return this.journalsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '내 매매일지 목록 (최신순)' })
  @ApiOkResponse({ type: TradeJournalResponseDto, isArray: true })
  findAll(@CurrentUserId() userId: string): Promise<TradeJournalResponseDto[]> {
    return this.journalsService.findAll(userId);
  }

  @Get('pending-review')
  @ApiOperation({ summary: '대시보드용 — 복기 미작성 매매일지 (오래된 순)' })
  @ApiOkResponse({ type: TradeJournalResponseDto, isArray: true })
  findPendingReview(
    @CurrentUserId() userId: string,
    @Query() query: PendingReviewQueryDto,
  ): Promise<TradeJournalResponseDto[]> {
    return this.journalsService.findPendingReview(userId, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '매매일지 상세 조회' })
  @ApiOkResponse({ type: TradeJournalResponseDto })
  @ApiNotFoundResponse({ description: '존재하지 않거나 내 매매일지가 아님' })
  findOne(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<TradeJournalResponseDto> {
    return this.journalsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '매매일지 수정' })
  @ApiOkResponse({ type: TradeJournalResponseDto })
  @ApiBadRequestResponse({ description: '입력값 검증 실패' })
  @ApiNotFoundResponse({ description: '존재하지 않거나 내 매매일지가 아님' })
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTradeJournalDto,
  ): Promise<TradeJournalResponseDto> {
    return this.journalsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '매매일지 삭제' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: '존재하지 않거나 내 매매일지가 아님' })
  remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.journalsService.remove(userId, id);
  }
}
