import { redirect } from 'next/navigation';

import LoginForm from '@/features/auth/components/LoginForm/LoginForm';
import { getCurrentUser } from '@/features/auth/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
