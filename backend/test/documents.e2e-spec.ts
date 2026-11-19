import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/create-test-app.js';
import { SESSION_COOKIE_NAME } from '../src/auth/constants/session.constants.js';

const SESSION_ID = 'test-session-id';
const USER_ID = 'test-user-id';
const ORGANIZATION_ID = 'test-organization-id';
const SECOND_ORGANIZATION_ID = 'second-organization-id';

const SESSION_DATA = {
  userId: USER_ID,
  createdAt: '2026-11-19T10:00:00.000Z',
};

const AUTHENTICATED_USER = {
  id: USER_ID,
  email: 'test@example.com',
  name: 'Test User',
  memberships: [
    {
      role: 'OWNER',
      organization: {
        id: ORGANIZATION_ID,
        name: 'Test Organization',
        slug: 'test-organization',
      },
    },
  ],
};

const CREATE_DOCUMENT_BODY = {
  title: 'NestJS Integration Testing',
  category: 'DEVELOPMENT',
  type: 'PDF',
  fileName: 'nestjs-testing.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1024,
};

const CREATED_DOCUMENT = {
  id: 'test-document-id',
  ...CREATE_DOCUMENT_BODY,
  status: 'READY',
  createdAt: new Date('2026-11-19T10:00:00.000Z'),
  updatedAt: new Date('2026-11-19T10:00:00.000Z'),
};

describe('Documents HTTP integration (e2e)', () => {
  let app: INestApplication;

  const prismaMock = {
    user: {
      findUnique: vi.fn(),
    },
    document: {
      create: vi.fn(),
    },
  };

  const redisMock = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    ping: vi.fn(),
  };

  const sessionCookie = `${SESSION_COOKIE_NAME}=${SESSION_ID}`;

  beforeEach(async () => {
    vi.clearAllMocks();

    prismaMock.user.findUnique.mockResolvedValue(AUTHENTICATED_USER);
    prismaMock.document.create.mockResolvedValue(CREATED_DOCUMENT);

    redisMock.get.mockImplementation(async (key: string) => {
      if (key === `session:${SESSION_ID}`) {
        return JSON.stringify(SESSION_DATA);
      }

      return null;
    });

    app = await createTestApp({
      prisma: prismaMock,
      redis: redisMock,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/documents/info', () => {
    it('should reject a request without a session cookie', async () => {
      const response = await request(app.getHttpServer()).get('/api/documents/info').expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });

      expect(redisMock.get).not.toHaveBeenCalled();
    });

    it('should reject a request with a non-existent session', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/documents/info')
        .set('Cookie', `${SESSION_COOKIE_NAME}=invalid-session`)
        .expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'INVALID_SESSION',
      });
    });

    it('should return module information for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/documents/info')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).toEqual({
        name: 'documents',
        status: 'initialized',
      });

      expect(redisMock.get).toHaveBeenCalledWith(`session:${SESSION_ID}`);
      expect(prismaMock.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('POST /api/documents', () => {
    it('should create a document in the authenticated user organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/documents')
        .set('Cookie', sessionCookie)
        .send(CREATE_DOCUMENT_BODY)
        .expect(201);

      expect(response.body).toMatchObject({
        id: CREATED_DOCUMENT.id,
        title: CREATE_DOCUMENT_BODY.title,
        category: CREATE_DOCUMENT_BODY.category,
        type: CREATE_DOCUMENT_BODY.type,
        status: 'READY',
      });

      expect(prismaMock.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ...CREATE_DOCUMENT_BODY,
            organizationId: ORGANIZATION_ID,
          }),
        }),
      );
    });

    it('should reject a request without an organization selection when the user has multiple organizations', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...AUTHENTICATED_USER,
        memberships: [
          ...AUTHENTICATED_USER.memberships,
          {
            role: 'MEMBER',
            organization: {
              id: SECOND_ORGANIZATION_ID,
              name: 'Second Organization',
              slug: 'second-organization',
            },
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .post('/api/documents')
        .set('Cookie', sessionCookie)
        .send(CREATE_DOCUMENT_BODY)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'BAD_REQUEST',
      });

      expect(prismaMock.document.create).not.toHaveBeenCalled();
    });

    it('should create a document in the explicitly selected organization', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...AUTHENTICATED_USER,
        memberships: [
          ...AUTHENTICATED_USER.memberships,
          {
            role: 'MEMBER',
            organization: {
              id: SECOND_ORGANIZATION_ID,
              name: 'Second Organization',
              slug: 'second-organization',
            },
          },
        ],
      });

      await request(app.getHttpServer())
        .post('/api/documents')
        .set('Cookie', sessionCookie)
        .set('x-organization-id', SECOND_ORGANIZATION_ID)
        .send(CREATE_DOCUMENT_BODY)
        .expect(201);

      expect(prismaMock.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: SECOND_ORGANIZATION_ID,
          }),
        }),
      );
    });

    it('should reject organizationId provided in the request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/documents')
        .set('Cookie', sessionCookie)
        .send({
          ...CREATE_DOCUMENT_BODY,
          organizationId: SECOND_ORGANIZATION_ID,
        })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'organizationId',
          }),
        ]),
      );

      expect(prismaMock.document.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/documents', () => {
    it('should reject organizationId provided in query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/documents')
        .query({ organizationId: SECOND_ORGANIZATION_ID })
        .set('Cookie', sessionCookie)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'organizationId',
          }),
        ]),
      );
    });
  });
});
