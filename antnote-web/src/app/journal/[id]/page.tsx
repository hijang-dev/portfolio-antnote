'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { RichTextView } from '@/components/RichTextView';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { JournalForm } from '@/features/journal/components/JournalForm';
import { useDeleteJournalMutation } from '@/features/journal/hooks/useDeleteJournalMutation';
import { useJournalQuery } from '@/features/journal/hooks/useJournalQuery';
import { useUpdateJournalMutation } from '@/features/journal/hooks/useUpdateJournalMutation';

export default function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { ready } = useRequireAuth();
  const { data: journal, isPending, isError } = useJournalQuery(id);
  const updateMutation = useUpdateJournalMutation();
  const deleteMutation = useDeleteJournalMutation();
  const [isEditing, setIsEditing] = useState(false);

  if (!ready) {
    return null;
  }

  if (isPending) {
    return <div className="p-16 text-sm text-zinc-500">불러오는 중…</div>;
  }

  if (isError || !journal) {
    return (
      <div className="p-16 text-sm text-red-600 dark:text-red-400">
        매매일지를 찾을 수 없습니다.
      </div>
    );
  }

  function handleDelete() {
    if (!journal || !window.confirm(`"${journal.title}"을(를) 삭제할까요?`)) {
      return;
    }
    deleteMutation.mutate(journal.id, {
      onSuccess: () => router.push('/journal'),
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-8 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Link href="/journal" className="text-xs underline">
          목록으로
        </Link>

        {isEditing ? (
          <JournalForm
            initialTitle={journal.title}
            initialStockName={journal.stockName}
            initialRationale={journal.rationale}
            initialReview={journal.review ?? ''}
            submitLabel="저장"
            pendingLabel="저장 중…"
            isSubmitting={updateMutation.isPending}
            error={updateMutation.error}
            onCancel={() => setIsEditing(false)}
            onSubmit={(input) =>
              updateMutation.mutate(
                { id: journal.id, input },
                { onSuccess: () => setIsEditing(false) },
              )
            }
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
                  {journal.title}
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {journal.stockName} ·{' '}
                  {new Date(journal.createdAt).toLocaleDateString('ko-KR')}
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
            </div>

            <section>
              <h2 className="mb-2 text-sm font-medium text-zinc-500">
                매매근거
              </h2>
              <RichTextView html={journal.rationale} />
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium text-zinc-500">
                매매복기
              </h2>
              {journal.review ? (
                <RichTextView html={journal.review} />
              ) : (
                <p className="text-sm text-zinc-400">
                  아직 복기를 작성하지 않았어요. &ldquo;수정&rdquo;을 눌러
                  복기를 남겨보세요.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
