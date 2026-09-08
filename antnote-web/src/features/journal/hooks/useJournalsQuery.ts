import { useQuery } from '@tanstack/react-query';
import { getJournals } from '../api';

export function useJournalsQuery() {
  return useQuery({
    queryKey: ['journals', 'list'],
    queryFn: getJournals,
  });
}
