import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

export function configureApp(app: INestApplication): void {
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors.map((error) => ({
            field: error.property,
            messages: Object.values(error.constraints ?? {}),
          })),
        }),
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(app.get(HttpAdapterHost)));

  app.setGlobalPrefix('api');
}
