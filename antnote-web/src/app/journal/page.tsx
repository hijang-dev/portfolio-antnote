'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { useJournalsQuery } from '@/features/journal/hooks/useJournalsQuery';

export default function JournalListPage() {
  const { ready } = useRequireAuth();
  const { data: journals, isPending, isError } = useJournalsQuery();

  if (!ready) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-8 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              매매일지
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              매매근거를 기록하고, 나중에 돌아와 복기를 남겨보세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs underline">
              대시보드로
            </Link>
            <Link
              href="/journal/new"
              className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium"
            >
              새 매매일지
            </Link>
          </div>
        </div>

        {isPending && <p className="text-sm text-zinc-500">불러오는 중…</p>}
        {isError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            매매일지를 불러오지 못했습니다.
          </p>
        )}
        {journals && journals.length === 0 && (
          <p className="text-sm text-zinc-500">
            아직 작성한 매매일지가 없어요. 위 버튼으로 첫 매매일지를
            작성해보세요.
          </p>
        )}

        {journals && journals.length > 0 && (
          <ul className="flex flex-col gap-3">
            {journals.map((journal) => (
              <li key={journal.id}>
                <Link
                  href={`/journal/${journal.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/10 p-4 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
                >
                  <div>
                    <p className="font-semibold text-black dark:text-zinc-50">
                      {journal.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {journal.stockName} ·{' '}
                      {new Date(journal.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span
                    className={
                      journal.review
                        ? 'rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-950 dark:text-green-400'
                        : 'rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }
                  >
                    {journal.review ? '복기 완료' : '복기 필요'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
