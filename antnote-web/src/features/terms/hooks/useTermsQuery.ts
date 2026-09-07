import { useQuery } from '@tanstack/react-query';
import { getTerms } from '../api';

export function useTermsQuery() {
  return useQuery({
    queryKey: ['terms', 'list'],
    queryFn: getTerms,
  });
}
