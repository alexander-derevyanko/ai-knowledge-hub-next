# AI Knowledge Hub — Backend

NestJS backend application for AI Knowledge Hub.

The backend provides the REST API, business logic, database access, and authentication foundation for the AI Knowledge Hub platform.

The application is designed around modular architecture, organization-scoped data access, and independently deployable services.

## Tech Stack

- Node.js 24+
- NestJS 12
- TypeScript
- REST API
- PostgreSQL 17
- Prisma ORM 7
- Prisma PostgreSQL driver adapter (`@prisma/adapter-pg`)
- Docker Compose
- Vitest
- Oxlint
- Prettier

### Planned

- Redis for session storage.
- `class-validator` and `class-transformer` for request validation.
- Cookie-based authentication.
- Automated integration and end-to-end tests.
- File storage and document processing.

---

## Architecture

The backend follows NestJS modular architecture.

```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── health/
│   ├── users/
│   ├── organizations/
│   ├── documents/
│   ├── generated/
│   ├── app.module.ts
│   └── main.ts
│
├── prisma7.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

`src/generated/prisma/` contains the generated Prisma client. It is excluded from Git and regenerated from the Prisma schema.

### Application modules

| Module                | Responsibility                                 |
| --------------------- | ---------------------------------------------- |
| `HealthModule`        | Application health check                       |
| `UsersModule`         | User data access and user-related operations   |
| `OrganizationsModule` | Organizations, memberships, and roles          |
| `DocumentsModule`     | Document metadata and organization-scoped CRUD |

### NestJS concepts used

- Modules define application boundaries and encapsulate providers.
- Controllers handle HTTP requests and responses.
- Services contain application and business logic.
- Dependency injection manages dependencies between providers.
- PrismaService provides database access to application modules.

---

## API

The global API prefix is:

```text
/api
```

The backend runs locally on port `3001` by default.

### Health

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| `GET`  | `/api/health` | Health check |

### Documents

| Method   | Endpoint             | Description              |
| -------- | -------------------- | ------------------------ |
| `GET`    | `/api/documents`     | Get documents            |
| `GET`    | `/api/documents/:id` | Get a document by ID     |
| `POST`   | `/api/documents`     | Create document metadata |
| `PATCH`  | `/api/documents/:id` | Update document metadata |
| `DELETE` | `/api/documents/:id` | Delete document metadata |

### Documents query parameters

The list endpoint currently supports:

| Parameter        | Description                          | Default     |
| ---------------- | ------------------------------------ | ----------- |
| `organizationId` | Organization scope                   | Required    |
| `page`           | Page number                          | `1`         |
| `limit`          | Number of records per page           | `10`        |
| `category`       | Document category filter             | —           |
| `status`         | Document status filter               | —           |
| `sortBy`         | `createdAt`, `updatedAt`, or `title` | `createdAt` |
| `sortOrder`      | `asc` or `desc`                      | `desc`      |

The list response uses a `data` and `meta` structure:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

### Current implementation scope

The Documents API manages document metadata in PostgreSQL.

It does not yet implement:

- Physical file upload.
- Binary file storage.
- Text extraction.
- Embeddings generation.
- AI processing.

**Temporary organization scope:** until authentication and authorization are implemented, `organizationId` is supplied by the request. It is used to scope document queries and mutations, but it is not a security boundary. A client must not be trusted to choose its own organization scope in the final implementation.

The planned implementation will derive the active organization context from the authenticated user and their membership.

---

## Database

PostgreSQL is the primary persistent database.

It runs locally in Docker Compose from the repository root.

### Prisma

The project uses Prisma 7 with the PostgreSQL driver adapter.

The Prisma schema is located at:

```text
prisma/schema.prisma
```

The Prisma configuration is located at:

```text
prisma7.config.ts
```

The generated client is located at:

```text
src/generated/prisma/
```

The generated client is not committed to Git.

### Data models

| Model                | Responsibility                                  |
| -------------------- | ----------------------------------------------- |
| `User`               | User account data                               |
| `Organization`       | Organization data                               |
| `OrganizationMember` | User membership and role within an organization |
| `Document`           | Document metadata and organization association  |

Organization roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

Documents are associated with an organization. Database queries and mutations in the Documents service are scoped by `organizationId`.

### Migrations

Create and apply a development migration:

```bash
npx prisma migrate dev --name migration_name
```

Check migration status:

```bash
npx prisma migrate status
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

The build lifecycle also generates the Prisma client through the configured prebuild step.

### Seed

The seed script is located at:

```text
prisma/seed.ts
```

Run it from the `backend` directory:

```bash
npx prisma db seed
```

The seed is idempotent and creates or reuses:

- A demo organization with slug `ai-knowledge-hub`.
- A demo user with email `demo@example.com`.
- An `OWNER` membership connecting the user to the organization.

The seed user's password hash is a placeholder and is not a valid login credential. Authentication implementation must introduce proper password hashing and credentials.

---

## Local Development

### Prerequisites

- Node.js 24+
- npm
- Docker Desktop

### 1. Configure environment variables

Environment configuration is stored in the repository root.

From the repository root:

```bash
cp .env.docker.example .env.docker
```

Configure the PostgreSQL credentials and `DATABASE_URL` in `.env.docker`.

Do not commit `.env.docker`.

The backend loads this environment file for local development and Prisma CLI operations.

### 2. Start PostgreSQL

Run from the repository root:

```bash
docker compose --env-file .env.docker up -d postgres
```

Check the service:

```bash
docker compose --env-file .env.docker ps
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Generate Prisma client

```bash
npm run prisma:generate
```

### 5. Apply database migrations

```bash
npx prisma migrate dev
```

### 6. Seed development data

```bash
npx prisma db seed
```

### 7. Start the backend

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3001/api
```

Health check:

```text
http://localhost:3001/api/health
```

---

## Available Scripts

Run scripts from the `backend` directory.

| Command                   | Description                      |
| ------------------------- | -------------------------------- |
| `npm run start:dev`       | Start NestJS in development mode |
| `npm run build`           | Build the backend                |
| `npm run lint`            | Run Oxlint                       |
| `npm run format`          | Format source files              |
| `npm run format:check`    | Check formatting                 |
| `npm run test`            | Run tests                        |
| `npm run prisma:generate` | Generate Prisma client           |

Prisma CLI commands such as `migrate dev`, `migrate status`, and `db seed` are executed with `npx prisma` from the `backend` directory.

---

## Development Progress

### Completed

- NestJS application setup.
- Global API prefix and health endpoint.
- Modular architecture.
- Controllers, providers, and dependency injection.
- REST API fundamentals.
- Initial CRUD implementation.
- PostgreSQL Docker Compose service.
- Prisma 7 integration with PostgreSQL.
- Database schema and initial migrations.
- Users and Organizations modules.
- Organization membership and roles.
- Database-backed Documents CRUD.
- Organization-scoped document operations.
- Pagination, filtering, and sorting.
- Idempotent development seed.

### Next steps

1. **DTOs and validation**
   - Request DTOs.
   - `class-validator`.
   - `class-transformer`.
   - Global `ValidationPipe`.
   - Query parameter transformation and validation.

2. **Error handling**
   - Global exception handling.
   - Consistent error response structure.
   - Stable machine-readable error codes.
   - Human-readable error messages.
   - Correct HTTP status codes.

3. **Authentication**
   - Password hashing.
   - Registration and login.
   - Cookie-based authentication.
   - Session lifecycle.

4. **Redis session storage**
   - Redis service in Docker Compose.
   - SessionStore abstraction.
   - Redis-backed session implementation.
   - Session TTL and invalidation.
   - Logout.

5. **Authorization and multi-tenancy**
   - Authentication guards.
   - Authenticated user context.
   - Organization membership checks.
   - Derive organization scope from authenticated context instead of request-supplied IDs.

6. **Frontend integration**
   - Connect the Next.js application to the backend.
   - Integrate authentication cookies.
   - Replace mock document data with API requests.
   - Handle API errors consistently.

7. **File lifecycle**
   - File upload.
   - File validation.
   - Storage abstraction.
   - Text extraction and processing status.

8. **AI capabilities**
   - Embeddings.
   - Vector search.
   - RAG.
   - LLM integration.

---

## Engineering Principles

- Keep modules focused and cohesive.
- Keep controllers thin and move business logic into services.
- Use dependency injection instead of manually constructing application dependencies.
- Keep persistent business data in PostgreSQL.
- Use Redis for ephemeral session data, not as a replacement for the primary database.
- Scope tenant-owned data by organization.
- Never expose password hashes through API responses.
- Validate external input at the API boundary.
- Return consistent, machine-readable API errors.
- Keep infrastructure and storage details behind clear abstractions.
- Prefer explicit, maintainable solutions over unnecessary abstractions.
