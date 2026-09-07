import { apiFetch } from '@/lib/api/client';

export interface Term {
  id: string;
  term: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
}

export function getRandomTerms(limit: number): Promise<Term[]> {
  return apiFetch<Term[]>(`/terms/random?limit=${limit}`);
}
