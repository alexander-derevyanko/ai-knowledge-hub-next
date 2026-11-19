import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { resolveOrganizationId } from '../organizations/utils/resolve-organization-id.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

import { DocumentsService } from './documents.service.js';
import type {
  CreateDocumentInput,
  FindAllDocumentsInput,
  UpdateDocumentInput,
} from './documents.service.js';

import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { FindAllDocumentsDto } from './dto/find-all-documents.dto.js';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('info')
  getModuleInfo(): { name: string; status: string } {
    return this.documentsService.getModuleInfo();
  }

  @Get()
  findAll(
    @Query() query: FindAllDocumentsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-organization-id') requestedOrganizationId?: string,
  ) {
    const organizationId = resolveOrganizationId(user, requestedOrganizationId);

    const input: FindAllDocumentsInput = query;

    return this.documentsService.findAll(organizationId, input);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-organization-id') requestedOrganizationId?: string,
  ) {
    const organizationId = resolveOrganizationId(user, requestedOrganizationId);

    return this.documentsService.findOne(id, organizationId);
  }

  @Post()
  createDocument(
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-organization-id') requestedOrganizationId?: string,
  ) {
    const organizationId = resolveOrganizationId(user, requestedOrganizationId);

    const input: CreateDocumentInput = {
      title: dto.title,
      category: dto.category,
      type: dto.type,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      organizationId,
    };

    return this.documentsService.createDocument(input);
  }

  @Patch(':id')
  updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-organization-id') requestedOrganizationId?: string,
  ) {
    const organizationId = resolveOrganizationId(user, requestedOrganizationId);

    const input: UpdateDocumentInput = {
      title: dto.title,
    };

    return this.documentsService.updateDocument(id, organizationId, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-organization-id') requestedOrganizationId?: string,
  ) {
    const organizationId = resolveOrganizationId(user, requestedOrganizationId);

    return this.documentsService.deleteDocument(id, organizationId);
  }
}
