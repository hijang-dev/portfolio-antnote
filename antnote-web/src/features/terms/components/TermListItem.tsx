'use client';

import { useState } from 'react';
import type { Term } from '../api';
import { useDeleteTermMutation } from '../hooks/useDeleteTermMutation';
import { useUpdateTermMutation } from '../hooks/useUpdateTermMutation';
import { TermForm } from './TermForm';

export function TermListItem({ term }: { term: Term }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateTermMutation();
  const deleteMutation = useDeleteTermMutation();

  function handleDelete() {
    if (!window.confirm(`"${term.term}"을(를) 삭제할까요?`)) {
      return;
    }
    deleteMutation.mutate(term.id);
  }

  if (isEditing) {
    return (
      <li className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <TermForm
          initialTerm={term.term}
          initialDefinition={term.definition}
          submitLabel="저장"
          pendingLabel="저장 중…"
          isSubmitting={updateMutation.isPending}
          error={updateMutation.error}
          onCancel={() => setIsEditing(false)}
          onSubmit={(input) =>
            updateMutation.mutate(
              { id: term.id, input },
              { onSuccess: () => setIsEditing(false) },
            )
          }
        />
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-black/10 p-4 dark:border-white/15">
      <div>
        <p className="font-semibold text-black dark:text-zinc-50">
          {term.term}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {term.definition}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.08]"
        >
          수정
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
