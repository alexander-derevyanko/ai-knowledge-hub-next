import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocumentDetailsPage from '@/features/documents/components/DocumentDetails/DocumentDetails';
import { getDocumentById } from '@/shared/api/documentsApi';

type PageProps = {
  params: Promise<{ id: string }>;
};

async function DocumentDetailsRoute({ params }: PageProps) {
  const { id } = await params;

  return <DocumentDetailsPage id={id} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const document = await getDocumentById(id);

  if (!document) {
    notFound();
  }

  return {
    title: document.title,
    description: `View ${document.title} in your knowledge base.`,
  };
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <DocumentDetailsRoute params={params} />
    </Suspense>
  );
}
