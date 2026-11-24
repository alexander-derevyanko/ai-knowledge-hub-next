import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import LoginForm from '@/features/auth/components/LoginForm/LoginForm';
import { getCurrentUser } from '@/features/auth/lib/current-user';

async function LoginPageContent() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
