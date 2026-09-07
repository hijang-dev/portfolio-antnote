import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateTermDto } from './dto/create-term.dto.js';
import { TermResponseDto } from './dto/term-response.dto.js';
import type { UpdateTermDto } from './dto/update-term.dto.js';
import { Term } from './entities/term.entity.js';

@Injectable()
export class TermsService {
  constructor(
    @InjectRepository(Term)
    private readonly termsRepository: Repository<Term>,
  ) {}

  async create(userId: string, dto: CreateTermDto): Promise<TermResponseDto> {
    const existing = await this.termsRepository.findOne({
      where: { userId, term: dto.term },
    });
    if (existing) {
      throw new ConflictException('이미 등록한 용어입니다.');
    }

    const term = this.termsRepository.create({
      userId,
      term: dto.term,
      definition: dto.definition,
    });
    return this.toResponse(await this.termsRepository.save(term));
  }

  async findAll(userId: string): Promise<TermResponseDto[]> {
    const terms = await this.termsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return terms.map((term) => this.toResponse(term));
  }

  async findOne(userId: string, id: string): Promise<TermResponseDto> {
    return this.toResponse(await this.findOwnedOrFail(userId, id));
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTermDto,
  ): Promise<TermResponseDto> {
    const term = await this.findOwnedOrFail(userId, id);

    if (dto.term && dto.term !== term.term) {
      const existing = await this.termsRepository.findOne({
        where: { userId, term: dto.term },
      });
      if (existing) {
        throw new ConflictException('이미 등록한 용어입니다.');
      }
    }

    Object.assign(term, dto);
    return this.toResponse(await this.termsRepository.save(term));
  }

  async remove(userId: string, id: string): Promise<void> {
    const term = await this.findOwnedOrFail(userId, id);
    await this.termsRepository.remove(term);
  }

  /**
   * Not found and "belongs to someone else" return the exact same 404 —
   * a 403 would confirm the id exists at all, letting a user enumerate
   * other people's term ids.
   */
  private async findOwnedOrFail(userId: string, id: string): Promise<Term> {
    const term = await this.termsRepository.findOne({ where: { id } });
    if (!term || term.userId !== userId) {
      throw new NotFoundException('용어를 찾을 수 없습니다.');
    }
    return term;
  }

  private toResponse(term: Term): TermResponseDto {
    return plainToInstance(TermResponseDto, term, {
      excludeExtraneousValues: true,
    });
  }
}
