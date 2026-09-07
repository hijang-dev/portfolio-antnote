import { useMutation } from '@tanstack/react-query';
import { signUp } from '../api';

// No cache write here (unlike login) — signUp doesn't start a session,
// so there's no "current user" yet for useCurrentUser to reflect.
export function useSignUpMutation() {
  return useMutation({ mutationFn: signUp });
}
