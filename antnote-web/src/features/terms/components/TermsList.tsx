'use client';

import { useTermsQuery } from '../hooks/useTermsQuery';
import { TermListItem } from './TermListItem';

export function TermsList() {
  const { data: terms, isPending, isError } = useTermsQuery();

  if (isPending) {
    return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        용어 목록을 불러오지 못했습니다.
      </p>
    );
  }

  if (terms.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        아직 등록한 용어가 없어요. 위 폼으로 첫 용어를 등록해보세요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {terms.map((term) => (
        <TermListItem key={term.id} term={term} />
      ))}
    </ul>
  );
}
