import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisService } from '../redis/redis.service.js';
import { SessionService, type SessionData } from './session.service.js';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

describe('SessionService', () => {
  let sessionService: SessionService;

  const redisServiceMock = {
    set: vi.fn<RedisService['set']>(),
    get: vi.fn<RedisService['get']>(),
    del: vi.fn<RedisService['del']>(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    sessionService = moduleRef.get<SessionService>(SessionService);
  });

  describe('create', () => {
    it('should create a new session and return the session ID', async () => {
      redisServiceMock.set.mockResolvedValue('OK');

      const userId = 'user123';

      const sessionId = await sessionService.create(userId);

      expect(sessionId).toMatch(/^[a-f0-9]{64}$/);

      expect(redisServiceMock.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.any(String),
        SESSION_TTL_SECONDS,
      );
    });

    it('should save correct session data in Redis', async () => {
      redisServiceMock.set.mockResolvedValue('OK');

      const userId = 'user123';

      await sessionService.create(userId);

      expect(redisServiceMock.set).toHaveBeenCalledOnce();

      const call = redisServiceMock.set.mock.calls[0];

      expect(call).toBeDefined();

      const [, serializedData, ttl] = call!;

      const sessionData = JSON.parse(serializedData) as SessionData;

      expect(sessionData.userId).toBe(userId);
      expect(new Date(sessionData.createdAt).toString()).not.toBe('Invalid Date');
      expect(ttl).toBe(SESSION_TTL_SECONDS);
    });

    it('should throw an error if Redis set fails', async () => {
      redisServiceMock.set.mockResolvedValue(null);

      await expect(sessionService.create('user123')).rejects.toThrow('Failed to create session');
    });
  });

  describe('find', () => {
    it('should return session data for a valid session ID', async () => {
      const sessionData: SessionData = {
        userId: 'user123',
        createdAt: new Date().toISOString(),
      };

      redisServiceMock.get.mockResolvedValue(JSON.stringify(sessionData));

      const sessionId = 'session123';

      const result = await sessionService.find(sessionId);

      expect(result).toEqual(sessionData);
      expect(redisServiceMock.get).toHaveBeenCalledWith(`session:${sessionId}`);
    });

    it('should return null for a non-existent session ID', async () => {
      redisServiceMock.get.mockResolvedValue(null);

      const sessionId = 'session123';

      const result = await sessionService.find(sessionId);

      expect(result).toBeNull();
      expect(redisServiceMock.get).toHaveBeenCalledWith(`session:${sessionId}`);
    });

    it('should throw an error if Redis contains invalid JSON', async () => {
      redisServiceMock.get.mockResolvedValue('{invalid json}');

      await expect(sessionService.find('session123')).rejects.toThrow(
        'Failed to parse session data',
      );
    });
  });

  describe('destroy', () => {
    it('should delete the session from Redis', async () => {
      redisServiceMock.del.mockResolvedValue(1);

      const sessionId = 'session123';

      await sessionService.destroy(sessionId);

      expect(redisServiceMock.del).toHaveBeenCalledWith(`session:${sessionId}`);
    });

    it('should not throw if the session does not exist', async () => {
      redisServiceMock.del.mockResolvedValue(0);

      await expect(sessionService.destroy('session123')).resolves.toBeUndefined();
    });
  });
});
