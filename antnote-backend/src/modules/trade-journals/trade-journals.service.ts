import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import {
  isEmptyRichText,
  normalizeOptionalRichText,
  sanitizeRichText,
} from '../../common/sanitize/sanitize-rich-text.js';
import type { CreateTradeJournalDto } from './dto/create-trade-journal.dto.js';
import { TradeJournalResponseDto } from './dto/trade-journal-response.dto.js';
import type { UpdateTradeJournalDto } from './dto/update-trade-journal.dto.js';
import { TradeJournal } from './entities/trade-journal.entity.js';

@Injectable()
export class TradeJournalsService {
  constructor(
    @InjectRepository(TradeJournal)
    private readonly journalsRepository: Repository<TradeJournal>,
  ) {}

  async create(
    userId: string,
    dto: CreateTradeJournalDto,
  ): Promise<TradeJournalResponseDto> {
    if (isEmptyRichText(dto.rationale)) {
      throw new BadRequestException('매매근거를 입력해주세요.');
    }

    const journal = this.journalsRepository.create({
      userId,
      title: dto.title,
      stockName: dto.stockName,
      rationale: sanitizeRichText(dto.rationale),
      review: normalizeOptionalRichText(dto.review),
    });
    return this.toResponse(await this.journalsRepository.save(journal));
  }

  async findAll(userId: string): Promise<TradeJournalResponseDto[]> {
    const journals = await this.journalsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return journals.map((journal) => this.toResponse(journal));
  }

  async findOne(userId: string, id: string): Promise<TradeJournalResponseDto> {
    return this.toResponse(await this.findOwnedOrFail(userId, id));
  }

  /**
   * For the dashboard's "아직 복기를 안 쓴 매매일지" widget — oldest
   * first, so the entries that have been sitting unreflected-on the
   * longest surface first.
   */
  async findPendingReview(
    userId: string,
    limit: number,
  ): Promise<TradeJournalResponseDto[]> {
    const journals = await this.journalsRepository
      .createQueryBuilder('journal')
      .where('journal.userId = :userId', { userId })
      .andWhere('journal.review IS NULL')
      .orderBy('journal.createdAt', 'ASC')
      .limit(limit)
      .getMany();
    return journals.map((journal) => this.toResponse(journal));
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTradeJournalDto,
  ): Promise<TradeJournalResponseDto> {
    const journal = await this.findOwnedOrFail(userId, id);

    if (dto.title !== undefined) {
      journal.title = dto.title;
    }
    if (dto.stockName !== undefined) {
      journal.stockName = dto.stockName;
    }
    if (dto.rationale !== undefined) {
      if (isEmptyRichText(dto.rationale)) {
        throw new BadRequestException('매매근거를 입력해주세요.');
      }
      journal.rationale = sanitizeRichText(dto.rationale);
    }
    if (dto.review !== undefined) {
      journal.review = normalizeOptionalRichText(dto.review);
    }

    return this.toResponse(await this.journalsRepository.save(journal));
  }

  async remove(userId: string, id: string): Promise<void> {
    const journal = await this.findOwnedOrFail(userId, id);
    await this.journalsRepository.remove(journal);
  }

  /**
   * Not found and "belongs to someone else" return the exact same 404 —
   * same reasoning as TermsService.findOwnedOrFail.
   */
  private async findOwnedOrFail(
    userId: string,
    id: string,
  ): Promise<TradeJournal> {
    const journal = await this.journalsRepository.findOne({ where: { id } });
    if (!journal || journal.userId !== userId) {
      throw new NotFoundException('매매일지를 찾을 수 없습니다.');
    }
    return journal;
  }

  private toResponse(journal: TradeJournal): TradeJournalResponseDto {
    return plainToInstance(TradeJournalResponseDto, journal, {
      excludeExtraneousValues: true,
    });
  }
}
