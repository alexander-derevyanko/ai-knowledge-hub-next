import { getApiErrorMessage } from '@/shared/api/apiError';

import { buildDocumentsSearchParams } from '../adapters/document-query.adapter';
import type { DocumentsQuery } from '../types/document-query';
import type { DocumentsResponse } from '../types/document';

export async function fetchDocuments(query: DocumentsQuery = {}): Promise<DocumentsResponse> {
  const searchParams = buildDocumentsSearchParams(query);
  const queryString = searchParams.toString();
  const url = `/api/documents${queryString ? `?${queryString}` : ''}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new Error('Unable to connect to the documents server');
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as DocumentsResponse;
}
