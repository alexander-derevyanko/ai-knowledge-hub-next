import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'ai-knowledge-hub-api',
    };
  }
}
