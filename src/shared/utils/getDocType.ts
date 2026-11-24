import { DocumentType } from '../types/document';

export const getDocType = (fileName: string): DocumentType | null => {
  const extension = fileName.split('.').pop()?.toUpperCase();

  if (!extension) {
    return null;
  }

  return Object.values(DocumentType).find((type) => type === extension) ?? null;
};
