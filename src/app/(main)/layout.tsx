import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/features/auth/lib/auth';
import AppLayout from '@/shared/components/layout/AppLayout/AppLayout';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
