'use client';

import { useId, useState } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ApiError } from '@/lib/api/client';

export interface JournalFormValues {
  title: string;
  stockName: string;
  rationale: string;
  review?: string;
}

interface JournalFormProps {
  initialTitle?: string;
  initialStockName?: string;
  initialRationale?: string;
  initialReview?: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (input: JournalFormValues) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  error: unknown;
}

export function JournalForm({
  initialTitle = '',
  initialStockName = '',
  initialRationale = '',
  initialReview = '',
  submitLabel,
  pendingLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: JournalFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [stockName, setStockName] = useState(initialStockName);
  const [rationale, setRationale] = useState(initialRationale);
  const [review, setReview] = useState(initialReview);
  const titleId = useId();
  const stockNameId = useId();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ title, stockName, rationale, review });
  }

  const errorMessage = error instanceof ApiError ? error.message : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium">
          제목
        </label>
        <input
          id={titleId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          placeholder="예: 삼성전자 단기 매매"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={stockNameId} className="text-sm font-medium">
          매매종목
        </label>
        <input
          id={stockNameId}
          value={stockName}
          onChange={(e) => setStockName(e.target.value)}
          required
          maxLength={100}
          placeholder="예: 삼성전자"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">매매근거</span>
        <RichTextEditor content={rationale} onChange={setRationale} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          매매복기{' '}
          <span className="font-normal text-zinc-400">
            (나중에 작성해도 됩니다)
          </span>
        </span>
        <RichTextEditor content={review} onChange={setReview} />
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
