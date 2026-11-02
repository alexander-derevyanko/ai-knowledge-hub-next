import type { Metadata } from 'next';

import DashboardPage from '@/features/dashboard/DashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your AI knowledge workspace.',
};

export default function Page() {
  return <DashboardPage />;
}
