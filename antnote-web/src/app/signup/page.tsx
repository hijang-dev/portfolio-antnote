import Link from 'next/link';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-8 py-24 dark:bg-black">
      <h1 className="text-xl font-semibold">회원가입</h1>
      <SignUpForm />
      <p className="text-xs text-zinc-500">
        이미 계정이 있다면{' '}
        <Link href="/login" className="underline">
          로그인
        </Link>
        해주세요.
      </p>
    </div>
  );
}
