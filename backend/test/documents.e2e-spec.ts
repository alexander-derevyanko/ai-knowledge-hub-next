import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { SESSION_COOKIE_NAME } from '../src/auth/constants/session.constants.js';
import { createTestApp } from './helpers/create-test-app.js';

const SESSION_ID = 'test-session-id';
const USER_ID = 'test-user-id';
const ORGANIZATION_ID = 'test-organization-id';
const SECOND_ORGANIZATION_ID = 'second-organization-id';
const DOCUMENT_ID = 'test-document-id';

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
  id: DOCUMENT_ID,
  ...CREATE_DOCUMENT_BODY,
  status: 'READY',
  createdAt: new Date('2026-11-19T10:00:00.000Z'),
  updatedAt: new Date('2026-11-19T10:00:00.000Z'),
};

const SECOND_DOCUMENT = {
  ...CREATED_DOCUMENT,
  id: 'second-document-id',
  title: 'Another document',
};

describe('Documents HTTP integration (e2e)', () => {
  let app: INestApplication;

  const prismaMock = {
    user: {
      findUnique: vi.fn(),
    },
    document: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
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
    prismaMock.document.findMany.mockResolvedValue([]);
    prismaMock.document.count.mockResolvedValue(0);
    prismaMock.document.findFirst.mockResolvedValue(CREATED_DOCUMENT);
    prismaMock.document.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.document.deleteMany.mockResolvedValue({ count: 1 });

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
            uploadedById: USER_ID,
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
            uploadedById: USER_ID,
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

    it('should reject uploadedById provided in the request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/documents')
        .set('Cookie', sessionCookie)
        .send({
          ...CREATE_DOCUMENT_BODY,
          uploadedById: 'another-user-id',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'uploadedById',
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

    it('should return documents belonging to the authenticated organization', async () => {
      prismaMock.document.findMany.mockResolvedValue([CREATED_DOCUMENT, SECOND_DOCUMENT]);
      prismaMock.document.count.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/api/documents')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).toMatchObject({
        data: [{ id: DOCUMENT_ID }, { id: SECOND_DOCUMENT.id }],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: ORGANIZATION_ID,
          },
        }),
      );

      expect(prismaMock.document.count).toHaveBeenCalledWith({
        where: {
          organizationId: ORGANIZATION_ID,
        },
      });

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should search documents by title and file name case-insensitively', async () => {
      await request(app.getHttpServer())
        .get('/api/documents')
        .query({ search: 'NESTJS' })
        .set('Cookie', sessionCookie)
        .expect(200);

      const expectedWhere = {
        organizationId: ORGANIZATION_ID,
        OR: [
          {
            title: {
              contains: 'NESTJS',
              mode: 'insensitive',
            },
          },
          {
            fileName: {
              contains: 'NESTJS',
              mode: 'insensitive',
            },
          },
        ],
      };

      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );

      expect(prismaMock.document.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should combine search with category and status filters', async () => {
      await request(app.getHttpServer())
        .get('/api/documents')
        .query({
          search: 'nestjs',
          category: 'DEVELOPMENT',
          status: 'READY',
        })
        .set('Cookie', sessionCookie)
        .expect(200);

      const expectedWhere = {
        organizationId: ORGANIZATION_ID,
        category: 'DEVELOPMENT',
        status: 'READY',
        OR: [
          {
            title: {
              contains: 'nestjs',
              mode: 'insensitive',
            },
          },
          {
            fileName: {
              contains: 'nestjs',
              mode: 'insensitive',
            },
          },
        ],
      };

      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );

      expect(prismaMock.document.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should ignore an empty search query after trimming whitespace', async () => {
      await request(app.getHttpServer())
        .get('/api/documents')
        .query({ search: '   ' })
        .set('Cookie', sessionCookie)
        .expect(200);

      const expectedWhere = {
        organizationId: ORGANIZATION_ID,
      };

      expect(prismaMock.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );

      expect(prismaMock.document.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should reject a search query longer than 200 characters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/documents')
        .query({ search: 'a'.repeat(201) })
        .set('Cookie', sessionCookie)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });

      expect(prismaMock.document.findMany).not.toHaveBeenCalled();
      expect(prismaMock.document.count).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return a document belonging to the authenticated organization', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).toMatchObject({
        id: DOCUMENT_ID,
        title: CREATED_DOCUMENT.title,
      });

      expect(prismaMock.document.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: DOCUMENT_ID,
            organizationId: ORGANIZATION_ID,
          },
        }),
      );
    });

    it('should return DOCUMENT_NOT_FOUND when the document does not belong to the authenticated organization', async () => {
      prismaMock.document.findFirst.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });

      expect(prismaMock.document.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: DOCUMENT_ID,
            organizationId: ORGANIZATION_ID,
          },
        }),
      );
    });

    it('should reject access to an organization the user does not belong to', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .set('x-organization-id', SECOND_ORGANIZATION_ID)
        .expect(403);

      expect(response.body).toMatchObject({
        statusCode: 403,
        code: 'FORBIDDEN',
      });

      expect(prismaMock.document.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/documents/:id', () => {
    it('should update a document belonging to the authenticated organization', async () => {
      const updatedDocument = {
        ...CREATED_DOCUMENT,
        title: 'Updated document title',
      };

      prismaMock.document.findFirst.mockResolvedValue(updatedDocument);

      const response = await request(app.getHttpServer())
        .patch(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .send({ title: 'Updated document title' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: DOCUMENT_ID,
        title: 'Updated document title',
      });

      expect(prismaMock.document.updateMany).toHaveBeenCalledWith({
        where: {
          id: DOCUMENT_ID,
          organizationId: ORGANIZATION_ID,
        },
        data: {
          title: 'Updated document title',
        },
      });
    });

    it('should return DOCUMENT_NOT_FOUND when updating a document outside the authenticated organization', async () => {
      prismaMock.document.updateMany.mockResolvedValue({ count: 0 });

      const response = await request(app.getHttpServer())
        .patch(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .send({ title: 'Updated document title' })
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });

      expect(prismaMock.document.updateMany).toHaveBeenCalledWith({
        where: {
          id: DOCUMENT_ID,
          organizationId: ORGANIZATION_ID,
        },
        data: {
          title: 'Updated document title',
        },
      });

      expect(prismaMock.document.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete a document belonging to the authenticated organization', async () => {
      await request(app.getHttpServer())
        .delete(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .expect(204);

      expect(prismaMock.document.deleteMany).toHaveBeenCalledWith({
        where: {
          id: DOCUMENT_ID,
          organizationId: ORGANIZATION_ID,
        },
      });
    });

    it('should return DOCUMENT_NOT_FOUND when deleting a document outside the authenticated organization', async () => {
      prismaMock.document.deleteMany.mockResolvedValue({ count: 0 });

      const response = await request(app.getHttpServer())
        .delete(`/api/documents/${DOCUMENT_ID}`)
        .set('Cookie', sessionCookie)
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });

      expect(prismaMock.document.deleteMany).toHaveBeenCalledWith({
        where: {
          id: DOCUMENT_ID,
          organizationId: ORGANIZATION_ID,
        },
      });
    });
  });
});
