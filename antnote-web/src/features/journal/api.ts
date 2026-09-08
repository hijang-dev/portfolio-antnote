import { apiFetch } from '@/lib/api/client';

export interface TradeJournal {
  id: string;
  title: string;
  stockName: string;
  rationale: string;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalInput {
  title: string;
  stockName: string;
  rationale: string;
  review?: string;
}

export type UpdateJournalInput = Partial<CreateJournalInput>;

export function getJournals(): Promise<TradeJournal[]> {
  return apiFetch<TradeJournal[]>('/trade-journals');
}

export function getJournal(id: string): Promise<TradeJournal> {
  return apiFetch<TradeJournal>(`/trade-journals/${id}`);
}

export function getPendingReviewJournals(
  limit: number,
): Promise<TradeJournal[]> {
  return apiFetch<TradeJournal[]>(
    `/trade-journals/pending-review?limit=${limit}`,
  );
}

export function createJournal(
  input: CreateJournalInput,
): Promise<TradeJournal> {
  return apiFetch<TradeJournal>('/trade-journals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateJournal(
  id: string,
  input: UpdateJournalInput,
): Promise<TradeJournal> {
  return apiFetch<TradeJournal>(`/trade-journals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteJournal(id: string): Promise<void> {
  return apiFetch<void>(`/trade-journals/${id}`, { method: 'DELETE' });
}
