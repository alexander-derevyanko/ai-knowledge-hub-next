import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService) {
    this.client = createClient({
      url: configService.getOrThrow<string>('REDIS_URL'),
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis client error', error);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  set(key: string, value: string, ttlSeconds: number): Promise<string | null> {
    return this.client.set(key, value, { EX: ttlSeconds });
  }

  del(key: string): Promise<number> {
    return this.client.del(key);
  }

  ping(): Promise<string> {
    return this.client.ping();
  }
}
