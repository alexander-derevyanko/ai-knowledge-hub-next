'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import type { DocumentsResponse } from '@/features/documents/types/document';

import { useDocuments } from '../../hooks/useDocuments';
import DocumentFilters from '../DocumentFilters/DocumentFilters';
import DocumentList from '../DocumentList/DocumentList';
import DocumentsPagination from '../DocumentsPagination/DocumentsPagination';

const DocumentUploadModal = dynamic(() => import('../DocumentUploadModal/DocumentUploadModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

type DocumentsClientProps = {
  initialData: DocumentsResponse;
};

export default function DocumentsClient({ initialData }: DocumentsClientProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    documents,
    meta,
    searchQuery,
    selectedCategory,
    sortOption,
    isLoading,
    error,
    handleSearchQuery,
    handleSelectedCategory,
    handleSortOption,
    handlePageChange,
    handleDocumentUpload,
  } = useDocuments({ initialData });

  const handleUploadSubmit = async (data: Parameters<typeof handleDocumentUpload>[0]) => {
    const isCreated = await handleDocumentUpload(data);

    if (isCreated) {
      setIsUploadModalOpen(false);
    }
  };

  return (
    <>
      <div className="documents__toolbar">
        <button className="documents__upload-button" onClick={() => setIsUploadModalOpen(true)}>
          Upload Document
        </button>
      </div>

      <DocumentFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        sortOption={sortOption}
        handleSearchQuery={handleSearchQuery}
        handleSelectedCategory={handleSelectedCategory}
        handleSortOption={handleSortOption}
      />

      {error && (
        <p role="alert" className="documents__error">
          {error}
        </p>
      )}

      <DocumentList documents={documents} totalCount={meta.total} isLoading={isLoading} />

      <DocumentsPagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />

      {isUploadModalOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSubmitDoc={handleUploadSubmit}
        />
      )}
    </>
  );
}
