export enum DocumentCategory {
  ARCHITECTURE = 'ARCHITECTURE',
  DEVELOPMENT = 'DEVELOPMENT',
  AI = 'AI',
  PRODUCT = 'PRODUCT',
  BUSINESS = 'BUSINESS',
  SECURITY = 'SECURITY',
}

export enum DocumentType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TXT = 'TXT',
  MD = 'MD',
}

export enum DocumentStatus {
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
}

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

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
