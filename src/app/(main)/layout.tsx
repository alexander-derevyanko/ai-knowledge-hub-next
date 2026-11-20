import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/features/auth/lib/auth';
import AppLayout from '@/shared/components/layout/AppLayout/AppLayout';

async function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </Suspense>
  );
}
