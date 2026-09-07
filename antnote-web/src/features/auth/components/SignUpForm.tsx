'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { useSignUpMutation } from '../hooks/useSignUpMutation';

export function SignUpForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const signUpMutation = useSignUpMutation();
  const loginMutation = useLoginMutation();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    signUpMutation.mutate(
      { username, password, nickname },
      {
        onSuccess: () => {
          // Sign up doesn't start a session by itself — log in right away
          // with the same credentials instead of sending the user back to
          // /login to type everything again.
          loginMutation.mutate(
            { username, password },
            {
              onSuccess: () => router.push('/dashboard'),
              onError: () => router.push('/login'),
            },
          );
        },
      },
    );
  }

  const error = signUpMutation.error ?? loginMutation.error;
  const errorMessage =
    error instanceof ApiError
      ? error.message
      : signUpMutation.isError
        ? '회원가입에 실패했습니다.'
        : null;

  const isSubmitting = signUpMutation.isPending || loginMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          아이디
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={4}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          title="영문, 숫자, 밑줄(_)만 사용할 수 있습니다."
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={64}
          title="영문과 숫자를 포함해 8자 이상 입력해주세요."
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className="text-sm font-medium">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          autoComplete="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isSubmitting ? '가입 중…' : '회원가입'}
      </button>
    </form>
  );
}
