import { apiFetch } from '@/lib/api/client';
import type { Term } from '@/features/terms/api';

export type { Term };

export function getRandomTerms(limit: number): Promise<Term[]> {
  return apiFetch<Term[]>(`/terms/random?limit=${limit}`);
}
