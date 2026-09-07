import { apiFetch } from '@/lib/api/client';

export interface Term {
  id: string;
  term: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermInput {
  term: string;
  definition: string;
}

export type UpdateTermInput = Partial<CreateTermInput>;

export function getTerms(): Promise<Term[]> {
  return apiFetch<Term[]>('/terms');
}

export function createTerm(input: CreateTermInput): Promise<Term> {
  return apiFetch<Term>('/terms', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTerm(id: string, input: UpdateTermInput): Promise<Term> {
  return apiFetch<Term>(`/terms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTerm(id: string): Promise<void> {
  return apiFetch<void>(`/terms/${id}`, { method: 'DELETE' });
}
