export enum DocumentCategory {
  Architecture = 'ARCHITECTURE',
  Development = 'DEVELOPMENT',
  AI = 'AI',
  Product = 'PRODUCT',
  Business = 'BUSINESS',
  Security = 'SECURITY',
}

export enum DocumentType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TXT = 'TXT',
  MD = 'MD',
}

export enum DocumentStatus {
  Ready = 'READY',
  Processing = 'PROCESSING',
  Failed = 'FAILED',
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
