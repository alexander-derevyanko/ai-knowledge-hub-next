import type { Document } from '../types/document';
import { DOCUMENTS } from './documents';

export async function fetchDocuments(): Promise<Document[]> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 2000);
  });

  return DOCUMENTS;
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const document = DOCUMENTS.find((item) => item.id === id);

  return document ?? null;
}
