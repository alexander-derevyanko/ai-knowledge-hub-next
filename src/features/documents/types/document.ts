import type { Document, DocumentCategory } from '@/shared/types/document';

export interface DocumentsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentsResponse {
  data: Document[];
  meta: DocumentsPaginationMeta;
}

export interface DocumentUploadFormValues {
  title: string;
  category: DocumentCategory;
  file: FileList;
}

export type CreateDocumentInput = Pick<
  Document,
  'title' | 'category' | 'type' | 'fileName' | 'mimeType' | 'sizeBytes'
>;
