import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { DocumentsService } from './documents.service.js';
import type {
  CreateDocumentInput,
  DocumentSortField,
  SortOrder,
  UpdateDocumentInput,
} from './documents.service.js';
import { DocumentCategory, DocumentStatus } from '../generated/prisma/client.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('info')
  getModuleInfo(): { name: string; status: string } {
    return this.documentsService.getModuleInfo();
  }

  @Get()
  findAll(
    @Query('organizationId') organizationId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: DocumentCategory,
    @Query('status') status?: DocumentStatus,
    @Query('sortBy') sortBy?: DocumentSortField,
    @Query('sortOrder') sortOrder?: SortOrder,
  ) {
    return this.documentsService.findAll(organizationId, {
      page: Number(page),
      limit: Number(limit),
      category,
      status,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.documentsService.findOne(id, organizationId);
  }

  @Post()
  createDocument(@Body() createDocumentDto: CreateDocumentInput) {
    return this.documentsService.createDocument(createDocumentDto);
  }

  @Patch(':id')
  updateDocument(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
    @Body() updateDocumentDto: UpdateDocumentInput,
  ) {
    return this.documentsService.updateDocument(id, organizationId, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDocument(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.documentsService.deleteDocument(id, organizationId);
  }
}
