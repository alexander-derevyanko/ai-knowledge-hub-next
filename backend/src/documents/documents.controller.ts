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
  FindAllDocumentsInput,
  UpdateDocumentInput,
} from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { FindAllDocumentsDto } from './dto/find-all-documents.dto.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('info')
  getModuleInfo(): { name: string; status: string } {
    return this.documentsService.getModuleInfo();
  }

  @Get()
  findAll(@Query() query: FindAllDocumentsDto) {
    const { organizationId, ...filters } = query;

    const input: FindAllDocumentsInput = filters;

    return this.documentsService.findAll(organizationId, input);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.documentsService.findOne(id, organizationId);
  }

  @Post()
  createDocument(@Body() dto: CreateDocumentDto) {
    const input: CreateDocumentInput = {
      title: dto.title,
      category: dto.category,
      type: dto.type,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      organizationId: dto.organizationId,
    };

    return this.documentsService.createDocument(input);
  }

  @Patch(':id')
  updateDocument(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    const input: UpdateDocumentInput = {
      title: dto.title,
    };

    return this.documentsService.updateDocument(id, organizationId, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDocument(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.documentsService.deleteDocument(id, organizationId);
  }
}
