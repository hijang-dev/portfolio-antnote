'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation';
import { RandomTermCards } from '@/features/dashboard/components/RandomTermCards';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isPending, isError } = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  // /auth/me came back 401 — there's no session, so this page has
  // nothing to show. Client-side redirect: the session lives in Redis,
  // not in a decodable cookie, so there's no way to check it without a
  // network call anyway (an Edge middleware guard couldn't do better).
  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  // `!user` covers the moment right after logout, between the cache being
  // cleared and the redirect to /login actually landing.
  if (isPending || isError || !user) {
    return null;
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.push('/login'),
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-8 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              {user.nickname}님, 안녕하세요
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              저장해둔 용어를 카드로 복습해보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.08]"
          >
            로그아웃
          </button>
        </div>

        <RandomTermCards />
      </main>
    </div>
  );
}
