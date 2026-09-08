'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { JournalForm } from '@/features/journal/components/JournalForm';
import { useCreateJournalMutation } from '@/features/journal/hooks/useCreateJournalMutation';

export default function NewJournalPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const createMutation = useCreateJournalMutation();

  if (!ready) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-8 py-16 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          새 매매일지
        </h1>
        <JournalForm
          submitLabel="작성"
          pendingLabel="작성 중…"
          isSubmitting={createMutation.isPending}
          error={createMutation.error}
          onSubmit={(input) =>
            createMutation.mutate(input, {
              onSuccess: () => router.push('/journal'),
            })
          }
          onCancel={() => router.push('/journal')}
        />
      </main>
    </div>
  );
}
