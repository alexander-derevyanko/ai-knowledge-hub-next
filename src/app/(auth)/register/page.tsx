import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import RegisterForm from '@/features/auth/components/RegisterForm/RegisterForm';
import { getCurrentUser } from '@/features/auth/lib/current-user';

async function RegisterPageContent() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
