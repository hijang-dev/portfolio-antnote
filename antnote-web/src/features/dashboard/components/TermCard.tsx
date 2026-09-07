'use client';

import { useState } from 'react';

interface TermCardProps {
  term: string;
  definition: string;
}

/**
 * Click to reveal — flashcard-style, so this actually functions as a
 * recall exercise instead of just re-reading two lines of text.
 */
export function TermCard({ term, definition }: TermCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed((prev) => !prev)}
      className="flex min-h-32 flex-col justify-center gap-2 rounded-xl border border-black/10 p-4 text-left transition-colors hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.05]"
    >
      <span className="text-base font-semibold text-black dark:text-zinc-50">
        {term}
      </span>
      {revealed ? (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {definition}
        </span>
      ) : (
        <span className="text-sm text-zinc-400 dark:text-zinc-600">
          눌러서 정의 보기
        </span>
      )}
    </button>
  );
}
