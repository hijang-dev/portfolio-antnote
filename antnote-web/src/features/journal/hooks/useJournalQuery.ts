import { useQuery } from '@tanstack/react-query';
import { getJournal } from '../api';

export function useJournalQuery(id: string) {
  return useQuery({
    queryKey: ['journals', 'detail', id],
    queryFn: () => getJournal(id),
  });
}
