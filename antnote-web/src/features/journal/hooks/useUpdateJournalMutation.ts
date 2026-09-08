import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateJournal, type UpdateJournalInput } from '../api';

export function useUpdateJournalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJournalInput }) =>
      updateJournal(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });
}
