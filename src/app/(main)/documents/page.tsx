import type { Metadata } from 'next';

import DocumentsPage from '@/features/documents/DocumentsPage';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Manage and browse your knowledge base documents.',
};

export default function Page() {
  return <DocumentsPage />;
}
