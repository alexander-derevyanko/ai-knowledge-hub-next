import type { DocumentCategory, DocumentStatus } from '@/shared/types/document';

export enum DocSortOption {
  Newest = 'newest',
  Oldest = 'oldest',
  TitleAsc = 'title-asc',
  TitleDesc = 'title-desc',
}

export type DocumentSortField = 'createdAt' | 'updatedAt' | 'title';

export type SortOrder = 'asc' | 'desc';

export interface DocumentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  sortBy?: DocumentSortField;
  sortOrder?: SortOrder;
}
