import { Suspense } from 'react';
import DocumentDetailsPage from '@/features/documents/components/DocumentDetails/DocumentDetails';

type PageProps = {
  params: Promise<{ id: string }>;
};

async function DocumentDetailsRoute({ params }: PageProps) {
  const { id } = await params;

  return <DocumentDetailsPage id={id} />;
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <DocumentDetailsRoute params={params} />
    </Suspense>
  );
}
