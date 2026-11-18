import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@nestjs/config';

import { RedisService } from './redis.service.js';

const { mockClient, mockCreateClient } = vi.hoisted(() => {
  const client = {
    connect: vi.fn<() => Promise<void>>(),
    quit: vi.fn<() => Promise<string>>(),
    get: vi.fn<(key: string) => Promise<string | null>>(),
    set: vi.fn<(key: string, value: string, options: { EX: number }) => Promise<string | null>>(),
    del: vi.fn<(key: string) => Promise<number>>(),
    ping: vi.fn<() => Promise<string>>(),
    on: vi.fn(),
    isOpen: true,
  };

  return {
    mockClient: client,
    mockCreateClient: vi.fn(() => client),
  };
});

vi.mock('redis', () => ({
  createClient: mockCreateClient,
}));

describe('RedisService', () => {
  let redisService: RedisService;

  const redisUrl = 'redis://localhost:6379';

  const configService = {
    getOrThrow: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient.isOpen = true;

    configService.getOrThrow.mockReturnValue(redisUrl);
    mockCreateClient.mockReturnValue(mockClient);

    redisService = new RedisService(configService as unknown as ConfigService);
  });

  describe('initialization', () => {
    it('should create Redis client with configured URL', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('REDIS_URL');

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: redisUrl,
      });
    });

    it('should register Redis error listener', () => {
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should connect to Redis on module initialization', async () => {
      await redisService.onModuleInit();

      expect(mockClient.connect).toHaveBeenCalledOnce();
    });
  });

  describe('destruction', () => {
    it('should close Redis connection on module destruction', async () => {
      mockClient.isOpen = true;

      await redisService.onModuleDestroy();

      expect(mockClient.quit).toHaveBeenCalledOnce();
    });

    it('should not close Redis connection if client is not open', async () => {
      mockClient.isOpen = false;

      await redisService.onModuleDestroy();

      expect(mockClient.quit).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return value for the provided key', async () => {
      mockClient.get.mockResolvedValue('session-data');

      const result = await redisService.get('session:123');

      expect(mockClient.get).toHaveBeenCalledWith('session:123');
      expect(result).toBe('session-data');
    });
  });

  describe('set', () => {
    it('should store value with expiration in seconds', async () => {
      mockClient.set.mockResolvedValue('OK');

      const result = await redisService.set('session:123', 'session-data', 3600);

      expect(mockClient.set).toHaveBeenCalledWith('session:123', 'session-data', { EX: 3600 });

      expect(result).toBe('OK');
    });
  });

  describe('del', () => {
    it('should delete value for the provided key', async () => {
      mockClient.del.mockResolvedValue(1);

      const result = await redisService.del('session:123');

      expect(mockClient.del).toHaveBeenCalledWith('session:123');
      expect(result).toBe(1);
    });
  });

  describe('ping', () => {
    it('should return Redis ping response', async () => {
      mockClient.ping.mockResolvedValue('PONG');

      const result = await redisService.ping();

      expect(mockClient.ping).toHaveBeenCalledOnce();
      expect(result).toBe('PONG');
    });
  });
});
