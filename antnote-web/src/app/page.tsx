import { SetupStatus } from '@/components/SetupStatus';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6 px-8 py-24">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            antnote
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Beginner-friendly stock investing — web client. Setup phase only;
            feature screens are added incrementally under{' '}
            <code className="rounded bg-black/[.06] px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/[.08]">
              src/features/
            </code>
            .
          </p>
        </div>

        <SetupStatus />
      </main>
    </div>
  );
}
