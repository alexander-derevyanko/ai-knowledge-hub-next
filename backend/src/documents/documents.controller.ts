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
} from '@nestjs/common';

import { DocumentsService } from './documents.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('info')
  getModuleInfo(): { name: string; status: string } {
    return this.documentsService.getModuleInfo();
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  createDocument(@Body() createDocumentDto: { title: string; category: string }) {
    return this.documentsService.createDocument(createDocumentDto);
  }

  @Patch(':id')
  updateDocument(@Param('id') id: string, @Body() updateDocumentDto: { title?: string }) {
    return this.documentsService.updateDocument(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
