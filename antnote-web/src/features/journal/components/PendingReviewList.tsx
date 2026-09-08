'use client';

import Link from 'next/link';
import { usePendingReviewQuery } from '../hooks/usePendingReviewQuery';

export function PendingReviewList() {
  const { data: journals, isPending, isError } = usePendingReviewQuery(5);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">
          복기가 필요한 매매일지
        </h2>
        <Link href="/journal" className="text-xs underline">
          전체 보기
        </Link>
      </div>

      {isPending && <p className="text-sm text-zinc-500">불러오는 중…</p>}
      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          매매일지를 불러오지 못했습니다.
        </p>
      )}
      {journals && journals.length === 0 && (
        <p className="text-sm text-zinc-500">
          복기가 필요한 매매일지가 없어요. 잘하고 있어요!
        </p>
      )}

      {journals && journals.length > 0 && (
        <ul className="flex flex-col gap-2">
          {journals.map((journal) => (
            <li key={journal.id}>
              <Link
                href={`/journal/${journal.id}`}
                className="flex items-center justify-between rounded-xl border border-black/10 p-3 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
              >
                <div>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">
                    {journal.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {journal.stockName} ·{' '}
                    {new Date(journal.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  복기 작성
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
