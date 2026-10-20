'use client';

import { useState, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';

import {
  DocCategory,
  DocSortOption,
  DocumentUploadFormValues,
  DocStatus,
} from '@/lib/types/document';
import { Document } from '@/lib/types/document';
import { getDocType } from '@/lib/utils/getDocType';
import { isEnumValue } from '@/lib/utils/isEnumValue';

import DocumentFilters from '../DocumentFilters/DocumentFilters';
import DocumentList from '../DocumentList/DocumentList';

const DocumentUploadModal = dynamic(() => import('../DocumentUploadModal/DocumentUploadModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

type DocumentsClientProps = {
  initialDocuments: Document[];
};

export default function DocumentsClient({ initialDocuments }: DocumentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | ''>('');
  const [sortOption, setSortOption] = useState(DocSortOption.Newest);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const visibleDocuments = documents
    .filter(({ title, category }) => {
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? category === selectedCategory : true;

      return matchesSearch && matchesCategory;
    })
    .sort((docA, docB) => {
      switch (sortOption) {
        case DocSortOption.Newest:
          return new Date(docB.updatedAt).getTime() - new Date(docA.updatedAt).getTime();

        case DocSortOption.Oldest:
          return new Date(docA.updatedAt).getTime() - new Date(docB.updatedAt).getTime();

        case DocSortOption.TitleAsc:
          return docA.title.localeCompare(docB.title);

        case DocSortOption.TitleDesc:
          return docB.title.localeCompare(docA.title);

        default:
          return 0;
      }
    });

  const handleSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectedCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === '') {
      setSelectedCategory('');

      return;
    }

    if (isEnumValue(DocCategory, value)) {
      setSelectedCategory(value);
    }
  };

  const handleSortOption = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (isEnumValue(DocSortOption, value)) {
      setSortOption(value);
    }
  };

  const handleDocumentUpload = (data: DocumentUploadFormValues) => {
    const file = data.file[0];

    if (!file) {
      return;
    }

    const type = getDocType(file.name);

    if (!type) {
      return;
    }

    const newDocument: Document = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      category: data.category,
      type,
      size: file.size,
      status: DocStatus.Ready,
      updatedAt: new Date().toISOString(),
    };

    setIsUploadModalOpen(false);

    setDocuments((prevDocuments) => [...prevDocuments, newDocument]);
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

      <DocumentList documents={visibleDocuments} />

      {isUploadModalOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSubmitDoc={handleDocumentUpload}
        />
      )}
    </>
  );
}
