import { useQuery } from '@tanstack/react-query';
import { getRandomTerms } from '../api';

const DEFAULT_CARD_COUNT = 10;

export function useRandomTermsQuery(limit: number = DEFAULT_CARD_COUNT) {
  return useQuery({
    queryKey: ['terms', 'random', limit],
    queryFn: () => getRandomTerms(limit),
    // Every render of the same page shouldn't reshuffle on its own —
    // reshuffling is an explicit user action (the "다시 섞기" button).
    staleTime: Infinity,
  });
}
