import { DocSortOption, type DocumentsQuery } from '../types/document-query';

interface SortConfig {
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

const SORT_CONFIG: Record<DocSortOption, SortConfig> = {
  [DocSortOption.Newest]: {
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
  [DocSortOption.Oldest]: {
    sortBy: 'updatedAt',
    sortOrder: 'asc',
  },
  [DocSortOption.TitleAsc]: {
    sortBy: 'title',
    sortOrder: 'asc',
  },
  [DocSortOption.TitleDesc]: {
    sortBy: 'title',
    sortOrder: 'desc',
  },
};

export function mapSortOptionToQuery(option: DocSortOption): SortConfig {
  return SORT_CONFIG[option];
}

export function buildDocumentsSearchParams(query: DocumentsQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }

  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }

  const search = query.search?.trim();

  if (search) {
    params.set('search', search);
  }

  if (query.category) {
    params.set('category', query.category);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.sortBy) {
    params.set('sortBy', query.sortBy);
  }

  if (query.sortOrder) {
    params.set('sortOrder', query.sortOrder);
  }

  return params;
}
