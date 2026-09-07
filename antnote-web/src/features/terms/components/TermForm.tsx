'use client';

import { useId, useState } from 'react';
import { ApiError } from '@/lib/api/client';

interface TermFormProps {
  initialTerm?: string;
  initialDefinition?: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (input: { term: string; definition: string }) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  error: unknown;
}

/**
 * Shared by both the "add a term" form and each list item's inline edit
 * form — same fields, same validation hints, same error display.
 */
export function TermForm({
  initialTerm = '',
  initialDefinition = '',
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: TermFormProps) {
  const [term, setTerm] = useState(initialTerm);
  const [definition, setDefinition] = useState(initialDefinition);
  // This form renders multiple times on the same page (the create form +
  // one per list item being edited) — hardcoded ids would duplicate.
  const termId = useId();
  const definitionId = useId();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ term, definition });
  }

  const errorMessage = error instanceof ApiError ? error.message : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={termId} className="text-sm font-medium">
          용어
        </label>
        <input
          id={termId}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          required
          maxLength={50}
          placeholder="예: PER"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={definitionId} className="text-sm font-medium">
          정의
        </label>
        <textarea
          id={definitionId}
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
          maxLength={1000}
          rows={3}
          placeholder="이 용어가 무슨 뜻인지 적어보세요"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-foreground text-background rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm dark:border-white/15"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
