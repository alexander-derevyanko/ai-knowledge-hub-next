import 'server-only';

import { getApiErrorMessage } from '@/shared/api/apiError';
import { backendFetch } from '@/shared/api/backendClient';
import { Document } from '@/shared/types/document';

import type { DocumentsQuery } from '../types/document-query';
import type { DocumentsResponse } from '../types/document';
import { mapDocumentsQueryToSearchParams } from '../mappers/document-query.mapper';

export async function fetchDocumentsServer(query: DocumentsQuery = {}): Promise<DocumentsResponse> {
  const searchParams = mapDocumentsQueryToSearchParams(query);
  const queryString = searchParams.toString();
  const path = `/documents${queryString ? `?${queryString}` : ''}`;

  const response = await backendFetch(path, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as DocumentsResponse;
}

export async function getDocumentByIdServer(id: string): Promise<Document | null> {
  const response = await backendFetch(`/documents/${encodeURIComponent(id)}`, {
    method: 'GET',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return (await response.json()) as Document;
}
