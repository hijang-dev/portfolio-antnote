import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-8 py-24 dark:bg-black">
      <h1 className="text-xl font-semibold">로그인</h1>
      <LoginForm />
      <p className="text-xs text-zinc-500">
        계정이 없다면 <code className="font-mono">POST /auth/signup</code>{' '}
        (Swagger:{' '}
        <Link
          href="http://localhost:3000/api/docs"
          className="underline"
          target="_blank"
        >
          /api/docs
        </Link>
        )로 먼저 만들어주세요.
      </p>
    </div>
  );
}
