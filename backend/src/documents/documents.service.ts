import { Injectable, NotFoundException } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

type DocumentsModuleInfo = {
  name: string;
  status: 'initialized';
};

const MOCK_DOCUMENTS = [
  {
    id: 'doc_1',
    title: 'NestJS Fundamentals',
    category: 'development',
    status: 'ready',
  },
  {
    id: 'doc_2',
    title: 'AI Architecture',
    category: 'ai',
    status: 'processing',
  },
];

@Injectable()
export class DocumentsService {
  getModuleInfo(): DocumentsModuleInfo {
    return {
      name: 'documents',
      status: 'initialized',
    };
  }

  findAll() {
    return MOCK_DOCUMENTS;
  }

  findOne(id: string) {
    const document = MOCK_DOCUMENTS.find((doc) => doc.id === id);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  createDocument(createDocumentDto: { title: string; category: string }) {
    const newDocument = {
      ...createDocumentDto,
      id: `doc_${randomUUID()}`,
      status: 'ready',
    };

    MOCK_DOCUMENTS.push(newDocument);

    return newDocument;
  }

  updateDocument(id: string, updateDocumentDto: { title?: string }) {
    const documentIndex = MOCK_DOCUMENTS.findIndex((doc) => doc.id === id);

    if (documentIndex === -1) {
      throw new NotFoundException('Document not found');
    }

    const updatedDocument = {
      ...MOCK_DOCUMENTS[documentIndex],
      ...updateDocumentDto,
    };

    MOCK_DOCUMENTS[documentIndex] = updatedDocument;

    return updatedDocument;
  }

  deleteDocument(id: string) {
    const documentIndex = MOCK_DOCUMENTS.findIndex((doc) => doc.id === id);

    if (documentIndex === -1) {
      throw new NotFoundException('Document not found');
    }

    MOCK_DOCUMENTS.splice(documentIndex, 1);
  }
}
