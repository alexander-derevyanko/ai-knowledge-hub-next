import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/configure-app.js';
import { PrismaService } from '../../src/database/prisma.service.js';
import { RedisService } from '../../src/redis/redis.service.js';

interface CreateTestAppOptions {
  prisma?: object;
  redis?: object;
}

export async function createTestApp(options: CreateTestAppOptions = {}): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(options.prisma ?? {})
    .overrideProvider(RedisService)
    .useValue(options.redis ?? {})
    .compile();

  const app = moduleRef.createNestApplication();

  configureApp(app);

  await app.init();

  return app;
}
