'use client';

import { useHealthQuery } from '@/lib/api/hooks/useHealthQuery';
import { useUiStore } from '@/store/useUiStore';

/**
 * Not a real feature — just proves the setup (TanStack Query hitting the
 * NestJS API, Zustand for client state) is wired correctly end to end.
 * Safe to delete once real feature modules land.
 *
 * Data-fetching logic (query key, retry policy) lives in useHealthQuery,
 * not here — this component only renders whatever the hook returns.
 */
export function SetupStatus() {
  const { data, isPending, isError } = useHealthQuery();
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
      <div className="flex items-center gap-2">
        <span className="font-medium">TanStack Query → backend /health:</span>
        {isPending && <span className="text-zinc-500">checking…</span>}
        {isError && (
          <span className="text-red-600 dark:text-red-400">
            unreachable (start antnote-backend)
          </span>
        )}
        {data && (
          <span className="text-green-600 dark:text-green-400">
            {data.status}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Zustand sidebarOpen:</span>
        <span>{String(sidebarOpen)}</span>
        <button
          onClick={toggleSidebar}
          className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.08]"
        >
          toggle
        </button>
      </div>
    </div>
  );
}
