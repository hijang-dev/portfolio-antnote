import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TradeJournal } from './entities/trade-journal.entity.js';
import { TradeJournalsService } from './trade-journals.service.js';

describe('TradeJournalsService', () => {
  let service: TradeJournalsService;
  let repo: {
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let queryBuilder: {
    where: ReturnType<typeof vi.fn>;
    andWhere: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    getMany: ReturnType<typeof vi.fn>;
  };

  const userId = 'owner-1';
  const otherUserId = 'owner-2';

  const existingJournal: TradeJournal = {
    id: 'journal-1',
    userId,
    title: '삼성전자 단기 매매',
    stockName: '삼성전자',
    rationale: '<p>실적 개선 기대</p>',
    review: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    queryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      getMany: vi.fn(),
    };
    repo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((input) => input),
      save: vi.fn(async (input) => input),
      remove: vi.fn(async (input) => input),
      createQueryBuilder: vi.fn(() => queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeJournalsService,
        { provide: getRepositoryToken(TradeJournal), useValue: repo },
      ],
    }).compile();

    service = module.get(TradeJournalsService);
  });

  describe('create', () => {
    it('sanitizes rationale and normalizes an empty review to null', async () => {
      const result = await service.create(userId, {
        title: '삼성전자 단기 매매',
        stockName: '삼성전자',
        rationale: '<p>실적 개선 기대</p><script>alert(1)</script>',
        review: '<p></p>',
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          rationale: '<p>실적 개선 기대</p>',
          review: null,
        }),
      );
      expect(result.rationale).not.toContain('script');
      expect(
        (result as unknown as Record<string, unknown>).userId,
      ).toBeUndefined();
    });

    it('rejects a rationale that is only an empty editor paragraph', async () => {
      await expect(
        service.create(userId, {
          title: 't',
          stockName: 's',
          rationale: '<p></p>',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('keeps a real review string when one is provided', async () => {
      await service.create(userId, {
        title: 't',
        stockName: 's',
        rationale: '<p>r</p>',
        review: '<p>복기 내용</p>',
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ review: '<p>복기 내용</p>' }),
      );
    });
  });

  describe('findAll', () => {
    it("returns only the given user's journals, whitelisted", async () => {
      repo.find.mockResolvedValue([existingJournal]);

      const result = await service.findAll(userId);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId } }),
      );
      expect(result).toHaveLength(1);
      expect(
        (result[0] as unknown as Record<string, unknown>).userId,
      ).toBeUndefined();
    });
  });

  describe('findPendingReview', () => {
    it('queries only entries with a null review, oldest first, capped at limit', async () => {
      queryBuilder.getMany.mockResolvedValue([existingJournal]);

      const result = await service.findPendingReview(userId, 5);

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('journal');
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'journal.userId = :userId',
        {
          userId,
        },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'journal.review IS NULL',
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'journal.createdAt',
        'ASC',
      );
      expect(queryBuilder.limit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException (not 403) when owned by someone else', async () => {
      repo.findOne.mockResolvedValue(existingJournal);

      await expect(
        service.findOne(otherUserId, existingJournal.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('only updates fields actually provided', async () => {
      repo.findOne.mockResolvedValue({ ...existingJournal });

      const result = await service.update(userId, existingJournal.id, {
        review: '<p>이제 복기 작성</p>',
      });

      expect(result.title).toBe(existingJournal.title);
      expect(result.review).toBe('<p>이제 복기 작성</p>');
    });

    it('throws NotFoundException when updating a journal owned by someone else', async () => {
      repo.findOne.mockResolvedValue(existingJournal);

      await expect(
        service.update(otherUserId, existingJournal.id, { title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects clearing rationale down to an empty editor paragraph', async () => {
      repo.findOne.mockResolvedValue({ ...existingJournal });

      await expect(
        service.update(userId, existingJournal.id, { rationale: '<p></p>' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes an owned journal', async () => {
      repo.findOne.mockResolvedValue(existingJournal);

      await service.remove(userId, existingJournal.id);

      expect(repo.remove).toHaveBeenCalledWith(existingJournal);
    });

    it('throws NotFoundException when removing a journal owned by someone else', async () => {
      repo.findOne.mockResolvedValue(existingJournal);

      await expect(
        service.remove(otherUserId, existingJournal.id),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
