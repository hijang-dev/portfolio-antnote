'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation';
import { RandomTermCards } from '@/features/dashboard/components/RandomTermCards';
import { PendingReviewList } from '@/features/journal/components/PendingReviewList';

export default function DashboardPage() {
  const router = useRouter();
  const { ready, user } = useRequireAuth();
  const logoutMutation = useLogoutMutation();

  if (!ready) {
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
          <div className="flex items-center gap-3">
            <Link href="/journal" className="text-xs underline">
              매매일지
            </Link>
            <Link href="/terms" className="text-xs underline">
              용어 관리
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.08]"
            >
              로그아웃
            </button>
          </div>
        </div>

        <RandomTermCards />
        <PendingReviewList />
      </main>
    </div>
  );
}
