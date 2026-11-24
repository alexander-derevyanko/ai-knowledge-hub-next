import { getApiErrorMessage } from '@/shared/api/apiError';

import { mapDocumentsQueryToSearchParams } from '../mappers/document-query.mapper';
import type { DocumentsQuery } from '../types/document-query';
import type { CreateDocumentInput, DocumentsResponse } from '../types/document';
import type { Document } from '@/shared/types/document';

export async function fetchDocuments(
  query: DocumentsQuery = {},
  signal?: AbortSignal,
): Promise<DocumentsResponse> {
  const searchParams = mapDocumentsQueryToSearchParams(query);
  const queryString = searchParams.toString();
  const url = `/api/documents${queryString ? `?${queryString}` : ''}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new Error('Unable to connect to the documents server');
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as DocumentsResponse;
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  let response: Response;

  try {
    response = await fetch('/api/documents', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Unable to connect to the documents server');
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as Document;
}
