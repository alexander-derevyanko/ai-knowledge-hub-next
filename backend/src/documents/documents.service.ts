import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service.js';
import type {
  DocumentCategory,
  DocumentStatus,
  DocumentType,
  Prisma,
} from '../generated/prisma/client.js';

type DocumentsModuleInfo = {
  name: string;
  status: 'initialized';
};

export type DocumentSortField = 'createdAt' | 'updatedAt' | 'title';

export type SortOrder = 'asc' | 'desc';

export type FindAllDocumentsInput = {
  page?: number;
  limit?: number;
  category?: DocumentCategory;
  status?: DocumentStatus;
  sortBy?: DocumentSortField;
  sortOrder?: SortOrder;
};

export type CreateDocumentInput = {
  title: string;
  category: DocumentCategory;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  organizationId: string;
};

export type UpdateDocumentInput = {
  title?: string;
};

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  getModuleInfo(): DocumentsModuleInfo {
    return {
      name: 'documents',
      status: 'initialized',
    };
  }

  async findAll(organizationId: string, input: FindAllDocumentsInput) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;

    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      organizationId,
      ...(input.category && { category: input.category }),
      ...(input.status && { status: input.status }),
    };

    const sortBy = input.sortBy ?? 'createdAt';
    const sortOrder = input.sortOrder ?? 'desc';

    const orderBy: Prisma.DocumentOrderByWithRelationInput[] = [
      { [sortBy]: sortOrder },
      { id: sortOrder },
    ];

    const [documents, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          type: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        type: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });
    }

    return document;
  }

  async createDocument(input: CreateDocumentInput) {
    return this.prisma.document.create({
      data: {
        title: input.title,
        category: input.category,
        type: input.type,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        organizationId: input.organizationId,
      },
      select: {
        id: true,
        title: true,
        category: true,
        type: true,
        status: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateDocument(id: string, organizationId: string, input: UpdateDocumentInput) {
    const result = await this.prisma.document.updateMany({
      where: {
        id,
        organizationId,
      },
      data: {
        title: input.title,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });
    }

    return this.prisma.document.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        title: true,
        category: true,
        type: true,
        status: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteDocument(id: string, organizationId: string): Promise<void> {
    const result = await this.prisma.document.deleteMany({
      where: {
        id,
        organizationId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });
    }
  }
}
