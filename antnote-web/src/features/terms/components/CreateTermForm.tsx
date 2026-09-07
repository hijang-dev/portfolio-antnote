'use client';

import { useState } from 'react';
import { useCreateTermMutation } from '../hooks/useCreateTermMutation';
import { TermForm } from './TermForm';

export function CreateTermForm() {
  const createMutation = useCreateTermMutation();
  // TermForm owns its own field state, initialized once from props — bumping
  // this key remounts it with empty fields after a successful create.
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="rounded-xl border border-black/10 p-4 dark:border-white/15">
      <h2 className="mb-3 text-sm font-medium text-zinc-500">새 용어 등록</h2>
      <TermForm
        key={resetKey}
        submitLabel="등록"
        pendingLabel="등록 중…"
        isSubmitting={createMutation.isPending}
        error={createMutation.error}
        onSubmit={(input) =>
          createMutation.mutate(input, {
            onSuccess: () => setResetKey((k) => k + 1),
          })
        }
      />
    </div>
  );
}
