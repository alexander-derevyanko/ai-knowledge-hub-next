import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import type { ApiErrorResponse } from '../interfaces/api-error-response.interface.js';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const response = context.getResponse();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const request = context.getRequest<{ method?: string; url?: string }>();
      const requestInfo = `${request.method ?? 'UNKNOWN'} ${request.url ?? 'UNKNOWN'}`;

      if (exception instanceof Error) {
        this.logger.error(`${requestInfo} - ${exception.message}`, exception.stack);
      } else {
        this.logger.error(`${requestInfo} - Unknown exception: ${String(exception)}`);
      }
    }

    const body = this.createErrorResponse(exception, statusCode);

    httpAdapter.reply(response, body, statusCode);
  }

  private createErrorResponse(exception: unknown, statusCode: number): ApiErrorResponse {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      };
    }

    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        code: this.getDefaultErrorCode(statusCode),
        message: exceptionResponse,
      };
    }

    const payload = exceptionResponse as Record<string, unknown>;

    return {
      statusCode,
      code: typeof payload.code === 'string' ? payload.code : this.getDefaultErrorCode(statusCode),
      message: typeof payload.message === 'string' ? payload.message : exception.message,
      ...(Array.isArray(payload.details) && {
        details: payload.details as ApiErrorResponse['details'],
      }),
    };
  }

  private getDefaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'HTTP_ERROR';
    }
  }
}
