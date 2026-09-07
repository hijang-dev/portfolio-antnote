import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTerm } from '../api';

export function useDeleteTermMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}
