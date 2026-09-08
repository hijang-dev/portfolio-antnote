import { useQuery } from '@tanstack/react-query';
import { getPendingReviewJournals } from '../api';

const DEFAULT_PENDING_REVIEW_COUNT = 5;

export function usePendingReviewQuery(
  limit: number = DEFAULT_PENDING_REVIEW_COUNT,
) {
  return useQuery({
    queryKey: ['journals', 'pending-review', limit],
    queryFn: () => getPendingReviewJournals(limit),
  });
}
