'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { createDocument, fetchDocuments } from '@/features/documents/api/documentsApi';
import type {
  CreateDocumentInput,
  DocumentUploadFormValues,
  DocumentsResponse,
} from '@/features/documents/types/document';
import { DocSortOption, type DocumentsQuery } from '@/features/documents/types/document-query';
import { DocumentCategory, DocumentType } from '@/shared/types/document';
import { getDocType } from '@/shared/utils/getDocType';
import { isEnumValue } from '@/shared/utils/isEnumValue';

import { mapSortOptionToQuery } from '../mappers/document-query.mapper';

const PAGE_SIZE = 10;

const MIME_TYPES: Record<DocumentType, string> = {
  [DocumentType.PDF]: 'application/pdf',
  [DocumentType.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  [DocumentType.TXT]: 'text/plain',
  [DocumentType.MD]: 'text/markdown',
};

interface UseDocumentsOptions {
  initialData: DocumentsResponse;
}

export function useDocuments({ initialData }: UseDocumentsOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | ''>('');
  const [sortOption, setSortOption] = useState(DocSortOption.Newest);
  const [page, setPage] = useState(initialData.meta.page);
  const [documentsResponse, setDocumentsResponse] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;

      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      const query: DocumentsQuery = {
        page,
        limit: PAGE_SIZE,
        search: searchQuery,
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...mapSortOptionToQuery(sortOption),
      };

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchDocuments(query, controller.signal);

        setDocumentsResponse(response);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : 'Unable to load documents',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, sortOption, page, refreshKey]);

  const handleSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleSelectedCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === '') {
      setSelectedCategory('');
      setPage(1);

      return;
    }

    if (isEnumValue(DocumentCategory, value)) {
      setSelectedCategory(value);
      setPage(1);
    }
  };

  const handleSortOption = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (isEnumValue(DocSortOption, value)) {
      setSortOption(value);
      setPage(1);
    }
  };

  const handlePageChange = (nextPage: number) => {
    const totalPages = documentsResponse.meta.totalPages;

    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  const handleDocumentUpload = async (data: DocumentUploadFormValues): Promise<boolean> => {
    const file = data.file[0];

    if (!file) {
      return false;
    }

    const type = getDocType(file.name);

    if (!type) {
      setError('Unsupported document format');

      return false;
    }

    const input: CreateDocumentInput = {
      title: data.title.trim(),
      category: data.category,
      type,
      fileName: file.name,
      mimeType: file.type || MIME_TYPES[type],
      sizeBytes: file.size,
    };

    try {
      setError(null);

      await createDocument(input);

      setPage(1);
      setRefreshKey((currentKey) => currentKey + 1);

      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create document');

      return false;
    }
  };

  return {
    documents: documentsResponse.data,
    meta: documentsResponse.meta,
    searchQuery,
    selectedCategory,
    sortOption,
    page,
    isLoading,
    error,
    handleSearchQuery,
    handleSelectedCategory,
    handleSortOption,
    handlePageChange,
    handleDocumentUpload,
  };
}
