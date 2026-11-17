import { Module } from '@nestjs/common';

import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';
import { PrismaModule } from '../database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
