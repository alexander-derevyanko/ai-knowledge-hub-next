import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PasswordService } from '../src/security/password.service.js';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '../src/auth/constants/session.constants.js';
import { createTestApp } from './helpers/create-test-app.js';

const USER_ID = 'test-user-id';
const ORGANIZATION_ID = 'test-organization-id';

const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'StrongPassword123!';
const ORGANIZATION_NAME = 'AI Knowledge Hub';

const AUTHENTICATED_USER = {
  id: USER_ID,
  email: USER_EMAIL,
  name: 'Test User',
  memberships: [
    {
      role: 'OWNER',
      organization: {
        id: ORGANIZATION_ID,
        name: ORGANIZATION_NAME,
        slug: 'ai-knowledge-hub',
      },
    },
  ],
};

const REGISTERED_USER = {
  id: USER_ID,
  email: USER_EMAIL,
  name: 'Test User',
  createdAt: new Date('2026-11-19T10:00:00.000Z'),
  memberships: [
    {
      role: 'OWNER',
      organization: {
        id: ORGANIZATION_ID,
        name: ORGANIZATION_NAME,
        slug: 'ai-knowledge-hub',
      },
    },
  ],
};

describe('Auth HTTP integration (e2e)', () => {
  let app: INestApplication;
  let passwordHash: string;

  const sessions = new Map<string, string>();

  const prismaMock = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const redisMock = {
    get: vi.fn(async (key: string) => sessions.get(key) ?? null),

    set: vi.fn(async (key: string, value: string) => {
      sessions.set(key, value);
      return 'OK';
    }),

    del: vi.fn(async (key: string) => {
      return sessions.delete(key) ? 1 : 0;
    }),

    ping: vi.fn(),
  };

  beforeAll(async () => {
    passwordHash = await new PasswordService().hash(USER_PASSWORD);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    sessions.clear();

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(REGISTERED_USER);

    app = await createTestApp({
      prisma: prismaMock,
      redis: redisMock,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user, create a session and authenticate with the session cookie', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(AUTHENTICATED_USER);

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: USER_EMAIL,
          password: USER_PASSWORD,
          organizationName: ORGANIZATION_NAME,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
        memberships: [
          {
            role: 'OWNER',
            organization: {
              id: ORGANIZATION_ID,
              name: ORGANIZATION_NAME,
              slug: 'ai-knowledge-hub',
            },
          },
        ],
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('sessionId');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email: USER_EMAIL,
          },
        }),
      );

      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: USER_EMAIL,
            name: 'Test User',
            passwordHash: expect.any(String),
            memberships: {
              create: {
                role: 'OWNER',
                organization: {
                  create: {
                    name: ORGANIZATION_NAME,
                    slug: expect.stringMatching(/^ai-knowledge-hub-[a-f0-9]{8}$/),
                  },
                },
              },
            },
          }),
        }),
      );

      const createCall = prismaMock.user.create.mock.calls[0][0];

      expect(createCall.data.passwordHash).not.toBe(USER_PASSWORD);
      expect(createCall.data.passwordHash).toBeTruthy();

      const setCookieHeader = response.headers['set-cookie'];

      expect(setCookieHeader).toBeDefined();

      const cookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;

      expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain(`Max-Age=${SESSION_TTL_SECONDS}`);

      const sessionCookie = cookie.split(';')[0];
      const sessionId = sessionCookie.split('=').slice(1).join('=');

      expect(sessionId).toMatch(/^[a-f0-9]{64}$/);

      expect(redisMock.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.any(String),
        SESSION_TTL_SECONDS,
      );

      expect(sessions.has(`session:${sessionId}`)).toBe(true);

      const currentUserResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(currentUserResponse.body).toEqual(AUTHENTICATED_USER);

      expect(redisMock.get).toHaveBeenCalledWith(`session:${sessionId}`);
    });

    it('should reject registration when the email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
        passwordHash,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: USER_EMAIL,
          password: USER_PASSWORD,
          organizationName: 'Another Organization',
        })
        .expect(409);

      expect(response.body).toMatchObject({
        statusCode: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(redisMock.set).not.toHaveBeenCalled();
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should reject registration with invalid DTO data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: 'short',
          organizationName: '',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
          expect.objectContaining({ field: 'organizationName' }),
        ]),
      );

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(redisMock.set).not.toHaveBeenCalled();
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate a user and set a session cookie', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
        passwordHash,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: USER_EMAIL,
          password: USER_PASSWORD,
        })
        .expect(201);

      expect(response.body).toEqual({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
      });

      expect(response.body).not.toHaveProperty('sessionId');
      expect(response.body).not.toHaveProperty('passwordHash');

      const setCookieHeader = response.headers['set-cookie'];

      expect(setCookieHeader).toBeDefined();

      const cookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;

      expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain(`Max-Age=${SESSION_TTL_SECONDS}`);

      const sessionId = cookie.split(';')[0].split('=').slice(1).join('=');

      expect(sessionId).toMatch(/^[a-f0-9]{64}$/);

      expect(redisMock.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.any(String),
        SESSION_TTL_SECONDS,
      );

      expect(sessions.has(`session:${sessionId}`)).toBe(true);
    });

    it('should reject login with an incorrect password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
        passwordHash,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: USER_EMAIL,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });

      expect(redisMock.set).not.toHaveBeenCalled();
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should reject login when the email does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: USER_PASSWORD,
        })
        .expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });

      expect(redisMock.set).not.toHaveBeenCalled();
    });

    it('should reject login with invalid DTO data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject a request without a session cookie', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/me').expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });

      expect(redisMock.get).not.toHaveBeenCalled();
    });

    it('should reject a request with an invalid session', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', `${SESSION_COOKIE_NAME}=invalid-session`)
        .expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_SESSION',
      });

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return the authenticated user with organization memberships', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
        passwordHash,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: USER_EMAIL,
          password: USER_PASSWORD,
        })
        .expect(201);

      const setCookieHeader = loginResponse.headers['set-cookie'];
      const cookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;

      const sessionCookie = cookie.split(';')[0];

      prismaMock.user.findUnique.mockResolvedValue(AUTHENTICATED_USER);

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).toEqual(AUTHENTICATED_USER);

      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: {
            id: USER_ID,
          },
          select: expect.objectContaining({
            memberships: expect.any(Object),
          }),
        }),
      );

      expect(redisMock.get).toHaveBeenCalledWith(`session:${sessionCookie.split('=')[1]}`);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should destroy the session, clear the cookie and reject subsequent requests', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: USER_EMAIL,
        name: 'Test User',
        passwordHash,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: USER_EMAIL,
          password: USER_PASSWORD,
        })
        .expect(201);

      const setCookieHeader = loginResponse.headers['set-cookie'];
      const cookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;

      const sessionCookie = cookie.split(';')[0];
      const sessionId = sessionCookie.split('=')[1];

      expect(sessions.has(`session:${sessionId}`)).toBe(true);

      const logoutResponse = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(logoutResponse.body).toEqual({
        success: true,
      });

      expect(redisMock.del).toHaveBeenCalledWith(`session:${sessionId}`);
      expect(sessions.has(`session:${sessionId}`)).toBe(false);

      const clearedCookieHeader = logoutResponse.headers['set-cookie'];

      expect(clearedCookieHeader).toBeDefined();

      const clearedCookie = Array.isArray(clearedCookieHeader)
        ? clearedCookieHeader[0]
        : clearedCookieHeader;

      expect(clearedCookie).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(clearedCookie).toContain('HttpOnly');
      expect(clearedCookie).toContain('SameSite=Lax');
      expect(clearedCookie).toContain('Path=/');
      expect(clearedCookie).toMatch(/Max-Age=0|Expires=/);

      const meResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(401);

      expect(meResponse.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_SESSION',
      });
    });

    it('should allow logout without a session cookie', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/logout').expect(200);

      expect(response.body).toEqual({
        success: true,
      });

      expect(redisMock.del).not.toHaveBeenCalled();
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});
