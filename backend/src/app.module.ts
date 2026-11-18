import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { PrismaModule } from './database/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env.docker',
    }),
    PrismaModule,
    HealthModule,
    DocumentsModule,
    UsersModule,
    OrganizationsModule,
    AuthModule,
  ],
})
export class AppModule {}
