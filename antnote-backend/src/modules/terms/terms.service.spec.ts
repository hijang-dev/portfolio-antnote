import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Term } from './entities/term.entity.js';
import { TermsService } from './terms.service.js';

describe('TermsService', () => {
  let service: TermsService;
  let repo: {
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  const userId = 'owner-1';
  const otherUserId = 'owner-2';

  const existingTerm: Term = {
    id: 'term-1',
    userId,
    term: 'PER',
    definition: '주가수익비율',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    repo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((input) => input),
      save: vi.fn(async (input) => input),
      remove: vi.fn(async (input) => input),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermsService,
        { provide: getRepositoryToken(Term), useValue: repo },
      ],
    }).compile();

    service = module.get(TermsService);
  });

  describe('create', () => {
    it('creates a term for the given user', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.create(userId, {
        term: 'PER',
        definition: '주가수익비율',
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ userId, term: 'PER' }),
      );
      expect(result).toMatchObject({ term: 'PER', definition: '주가수익비율' });
      expect(
        (result as unknown as Record<string, unknown>).userId,
      ).toBeUndefined();
    });

    it('rejects a term the user already registered with ConflictException', async () => {
      repo.findOne.mockResolvedValue(existingTerm);

      await expect(
        service.create(userId, { term: 'PER', definition: '다른 설명' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it("returns only the given user's terms, whitelisted", async () => {
      repo.find.mockResolvedValue([existingTerm]);

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

  describe('findOne', () => {
    it('returns the term when owned by the requesting user', async () => {
      repo.findOne.mockResolvedValue(existingTerm);

      const result = await service.findOne(userId, existingTerm.id);

      expect(result.id).toBe(existingTerm.id);
    });

    it('throws NotFoundException when the term does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, 'missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException (not 403) when the term belongs to someone else', async () => {
      repo.findOne.mockResolvedValue(existingTerm);

      await expect(
        service.findOne(otherUserId, existingTerm.id),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates fields on an owned term', async () => {
      repo.findOne
        .mockResolvedValueOnce(existingTerm) // ownership lookup
        .mockResolvedValueOnce(null); // no clash with the new name

      const result = await service.update(userId, existingTerm.id, {
        definition: '수정된 설명',
      });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ definition: '수정된 설명' }),
      );
      expect(result.definition).toBe('수정된 설명');
    });

    it('throws NotFoundException when updating a term owned by someone else', async () => {
      repo.findOne.mockResolvedValue(existingTerm);

      await expect(
        service.update(otherUserId, existingTerm.id, { definition: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects renaming into a term that already exists for that user', async () => {
      repo.findOne
        .mockResolvedValueOnce(existingTerm) // ownership lookup
        .mockResolvedValueOnce({ ...existingTerm, id: 'other-term' }); // name clash

      await expect(
        service.update(userId, existingTerm.id, { term: 'EPS' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes an owned term', async () => {
      repo.findOne.mockResolvedValue(existingTerm);

      await service.remove(userId, existingTerm.id);

      expect(repo.remove).toHaveBeenCalledWith(existingTerm);
    });

    it('throws NotFoundException when removing a term owned by someone else', async () => {
      repo.findOne.mockResolvedValue(existingTerm);

      await expect(
        service.remove(otherUserId, existingTerm.id),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
