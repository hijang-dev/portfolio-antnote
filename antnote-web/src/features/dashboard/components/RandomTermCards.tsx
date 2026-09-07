'use client';

import { useRandomTermsQuery } from '../hooks/useRandomTermsQuery';
import { TermCard } from './TermCard';

export function RandomTermCards() {
  const {
    data: terms,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useRandomTermsQuery(10);

  if (isPending) {
    return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        용어를 불러오지 못했습니다.
      </p>
    );
  }

  if (terms.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        아직 등록한 용어가 없어요. 용어를 등록하면 여기서 무작위로 복습할 수
        있어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">오늘의 복습 카드</h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.08]"
        >
          {isRefetching ? '섞는 중…' : '다시 섞기'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {terms.map((term) => (
          <TermCard
            key={term.id}
            term={term.term}
            definition={term.definition}
          />
        ))}
      </div>
    </div>
  );
}
