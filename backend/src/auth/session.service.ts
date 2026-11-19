import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { RedisService } from '../redis/redis.service.js';
import { SESSION_TTL_SECONDS } from './constants/session.constants.js';

export interface SessionData {
  userId: string;
  createdAt: string;
}

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async create(userId: string): Promise<string> {
    const sessionId = randomBytes(32).toString('hex');
    const sessionData: SessionData = {
      userId,
      createdAt: new Date().toISOString(),
    };

    const redisKey = this.getSessionKey(sessionId);
    const redisValue = JSON.stringify(sessionData);

    const result = await this.redisService.set(redisKey, redisValue, SESSION_TTL_SECONDS);

    if (result !== 'OK') {
      throw new InternalServerErrorException('Failed to create session');
    }

    return sessionId;
  }

  async find(sessionId: string): Promise<SessionData | null> {
    const redisKey = this.getSessionKey(sessionId);
    const redisValue = await this.redisService.get(redisKey);

    if (redisValue === null) {
      return null;
    }

    try {
      const sessionData: SessionData = JSON.parse(redisValue);

      return sessionData;
    } catch {
      throw new InternalServerErrorException('Failed to parse session data');
    }
  }

  async destroy(sessionId: string): Promise<void> {
    const redisKey = this.getSessionKey(sessionId);

    await this.redisService.del(redisKey);
  }

  private getSessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }
}
