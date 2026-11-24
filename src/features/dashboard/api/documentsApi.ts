import 'server-only';

import type { Document } from '@/shared/types/document';
import { DOCUMENTS } from '../data/documents';

// TODO: temporary for the dashboard. Will be removed during Dashboard integration
export async function fetchDocuments(): Promise<Document[]> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 2000);
  });

  return [...DOCUMENTS];
}
