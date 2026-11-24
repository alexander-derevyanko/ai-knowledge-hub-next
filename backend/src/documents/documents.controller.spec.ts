import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

import { DocumentsController } from './documents.controller.js';
import type { DocumentsService } from './documents.service.js';
import type {
  CreateDocumentInput,
  FindAllDocumentsInput,
  UpdateDocumentInput,
} from './documents.service.js';

import type { CreateDocumentDto } from './dto/create-document.dto.js';
import type { UpdateDocumentDto } from './dto/update-document.dto.js';
import type { FindAllDocumentsDto } from './dto/find-all-documents.dto.js';

const organizationA = {
  id: 'org-a',
  name: 'Organization A',
  slug: 'organization-a',
};

const organizationB = {
  id: 'org-b',
  name: 'Organization B',
  slug: 'organization-b',
};

const userWithOneOrganization = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  memberships: [
    {
      role: 'OWNER',
      organization: organizationA,
    },
  ],
} as AuthenticatedUser;

const userWithTwoOrganizations = {
  ...userWithOneOrganization,
  memberships: [
    {
      role: 'OWNER',
      organization: organizationA,
    },
    {
      role: 'MEMBER',
      organization: organizationB,
    },
  ],
} as AuthenticatedUser;

describe('DocumentsController', () => {
  const documentsService = {
    getModuleInfo: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  };

  let controller: DocumentsController;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new DocumentsController(documentsService as unknown as DocumentsService);
  });

  describe('getModuleInfo', () => {
    it('should return documents module information', () => {
      const moduleInfo = {
        name: 'documents',
        status: 'initialized',
      };

      documentsService.getModuleInfo.mockReturnValue(moduleInfo);

      expect(controller.getModuleInfo()).toEqual(moduleInfo);
      expect(documentsService.getModuleInfo).toHaveBeenCalledOnce();
    });
  });

  describe('findAll', () => {
    it('should use the only organization available to the user', async () => {
      const query = {
        page: 2,
        limit: 5,
      } as FindAllDocumentsDto;

      await controller.findAll(query, userWithOneOrganization);

      expect(documentsService.findAll).toHaveBeenCalledWith(
        organizationA.id,
        query satisfies FindAllDocumentsInput,
      );
    });

    it('should use the organization specified in the request header', async () => {
      const query = {
        page: 1,
        limit: 10,
      } as FindAllDocumentsDto;

      await controller.findAll(query, userWithTwoOrganizations, organizationB.id);

      expect(documentsService.findAll).toHaveBeenCalledWith(organizationB.id, query);
    });

    it('should reject access to an organization the user does not belong to', () => {
      expect(() =>
        controller.findAll({} as FindAllDocumentsDto, userWithOneOrganization, 'foreign-org'),
      ).toThrow(ForbiddenException);

      expect(documentsService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a document within the user organization', async () => {
      await controller.findOne('document-1', userWithOneOrganization);

      expect(documentsService.findOne).toHaveBeenCalledWith('document-1', organizationA.id);
    });
  });

  describe('createDocument', () => {
    it('should derive organizationId from the authenticated user context', async () => {
      const dto = {
        title: 'NestJS Architecture',
        category: 'DEVELOPMENT',
        type: 'PDF',
        fileName: 'nestjs-architecture.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      } as CreateDocumentDto;

      const expectedInput: CreateDocumentInput = {
        title: dto.title,
        category: dto.category,
        type: dto.type,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        organizationId: organizationA.id,
        uploadedById: userWithOneOrganization.id,
      };

      await controller.createDocument(dto, userWithOneOrganization);

      expect(documentsService.createDocument).toHaveBeenCalledWith(expectedInput);
    });
  });

  describe('updateDocument', () => {
    it('should update a document within the selected organization', async () => {
      const dto = {
        title: 'Updated title',
      } as UpdateDocumentDto;

      const expectedInput: UpdateDocumentInput = {
        title: dto.title,
      };

      await controller.updateDocument(
        'document-1',
        dto,
        userWithTwoOrganizations,
        organizationB.id,
      );

      expect(documentsService.updateDocument).toHaveBeenCalledWith(
        'document-1',
        organizationB.id,
        expectedInput,
      );
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document within the user organization', async () => {
      await controller.deleteDocument('document-1', userWithOneOrganization);

      expect(documentsService.deleteDocument).toHaveBeenCalledWith('document-1', organizationA.id);
    });
  });
});
