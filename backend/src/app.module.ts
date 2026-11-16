import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { PrismaModule } from './database/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env.docker',
    }),
    PrismaModule,
    HealthModule,
    DocumentsModule,
  ],
})
export class AppModule {}
