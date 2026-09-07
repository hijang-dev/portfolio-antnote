'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { CreateTermForm } from '@/features/terms/components/CreateTermForm';
import { TermsList } from '@/features/terms/components/TermsList';

export default function TermsPage() {
  const { ready } = useRequireAuth();

  if (!ready) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-8 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              내 용어 관리
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              등록/수정/삭제한 내용은 대시보드 카드에도 바로 반영됩니다.
            </p>
          </div>
          <Link href="/dashboard" className="text-xs underline">
            대시보드로
          </Link>
        </div>

        <CreateTermForm />
        <TermsList />
      </main>
    </div>
  );
}
