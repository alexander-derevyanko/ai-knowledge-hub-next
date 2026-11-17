# AI Knowledge Hub — Backend

The backend is an independent REST API application for AI Knowledge Hub, built with NestJS, TypeScript, Prisma ORM, and PostgreSQL.

It provides the server-side foundation for application features, handling domain operations, business logic, and persistent data.

The backend is designed around modular architecture, clear separation of responsibilities, and incremental development.

> **Status:** The initial backend foundation is implemented, including database integration, user and organization modules, document metadata operations, request validation, and standardized error handling.

---

## Technology Stack

- Node.js 24
- NestJS 12
- TypeScript
- PostgreSQL 17
- Prisma ORM 7
- `@prisma/adapter-pg`
- `class-validator`
- `class-transformer`
- Vitest
- Oxlint

The application uses ECMAScript modules (ESM) and TypeScript `NodeNext` module resolution.

---

## Architecture

The backend follows NestJS modular architecture.

Its main responsibilities include:

- Handling HTTP requests and responses.
- Validating incoming data.
- Implementing application and domain logic.
- Managing persistent data through Prisma.
- Enforcing organization-scoped data operations.
- Providing shared infrastructure for error handling and database access.

### Project Structure

```text
backend/
├── prisma/
│   └── migrations/
│
├── src/
│   ├── common/
│   ├── database/
│   ├── documents/
│   │   └── dto/
│   ├── health/
│   ├── organizations/
│   ├── users/
│   ├── generated/
│   │   └── prisma/
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── prisma7.config.ts
├── package.json
└── README.md
```

### Module Responsibilities

| Module                | Responsibility                             |
| --------------------- | ------------------------------------------ |
| `HealthModule`        | Application health check                   |
| `PrismaModule`        | Database connection and Prisma integration |
| `UsersModule`         | User-related operations                    |
| `OrganizationsModule` | Organizations and memberships              |
| `DocumentsModule`     | Document metadata operations               |
| `common/`             | Shared application infrastructure          |

Controllers handle HTTP concerns, DTOs validate incoming requests, services contain application logic, and Prisma provides database access.

---

## Getting Started

### Prerequisites

- Node.js 24.x
- npm
- Docker with Docker Compose

PostgreSQL is provided through the repository's Docker Compose configuration.

### 1. Install Dependencies

From the repository root:

```bash
cd backend
npm install
```

### 2. Configure Environment

The local PostgreSQL environment configuration is maintained in the repository root.

From the repository root:

```bash
cp .env.docker.example .env.docker
```

Configure the database credentials and connection settings in `.env.docker`.

The backend uses the root environment configuration during local development.

The `.env.docker` file contains local credentials and must not be committed.

### 3. Start PostgreSQL

From the repository root:

```bash
docker compose --env-file .env.docker up -d
```

Check the database container:

```bash
docker compose --env-file .env.docker ps
```

The default local configuration exposes PostgreSQL on:

```text
127.0.0.1:5432
```

The database uses a named Docker volume to persist data between container restarts.

Stop the database:

```bash
docker compose --env-file .env.docker down
```

> **Warning:** Using `docker compose down -v` removes named volumes and deletes the local database data.

### 4. Initialize the Database

From `backend/`:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

The Prisma client is generated under:

```text
src/generated/prisma/
```

Generated files should not be edited manually or committed.

### 5. Start the Backend

```bash
npm run start:dev
```

The backend is available at:

```text
http://localhost:3001
```

The global API prefix is `/api`.

---

## Database

PostgreSQL is the primary relational database used for persistent application data.

Prisma ORM provides database access, schema management, and migrations.

The current data model covers users, organizations, organization memberships, and document metadata.

Database schema and relationships are defined in:

```text
prisma/schema.prisma
```

### Prisma Commands

Generate the client:

```bash
npm run prisma:generate
```

Create and apply a development migration:

```bash
npx prisma migrate dev --name <migration-name>
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

### Development Seed

The project includes development seed data for the initial user, organization, membership, and documents.

The seed is designed to be idempotent.

Seeded credentials are development data only. The placeholder password hash is not a valid login credential.

---

## API Overview

The backend exposes a REST API under the `/api` prefix.

Current functional areas include:

- Health checks.
- User-related operations.
- Organization and membership operations.
- Document metadata management.

The Documents API currently supports CRUD operations, organization-scoped access, pagination, filtering, and sorting.

Incoming requests are validated through DTOs and the global NestJS `ValidationPipe`.

HTTP errors are handled through a global exception filter that provides a consistent response structure.

The API implementation and DTOs are the source of truth for current request and response contracts.

Detailed API documentation can be introduced separately as the number of endpoints and integrations grows.

### Multi-Tenancy

Organization-owned document operations are scoped by `organizationId`.

At this stage, the organization identifier is supplied by the API client. This is an interim implementation.

Once authentication and authorization are introduced, the backend must derive organization context from the authenticated user and verify membership server-side rather than trusting client-supplied identifiers.

---

## Development Commands

Run commands from `backend/`.

### Application

Start in development mode:

```bash
npm run start:dev
```

Build the application:

```bash
npm run build
```

Run the production build:

```bash
npm run start:prod
```

### Code Quality

Run lint:

```bash
npm run lint
```

Run TypeScript type checking:

```bash
npm run typecheck
```

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

### Formatting

Format source files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

### Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Create a migration:

```bash
npx prisma migrate dev --name <migration-name>
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## Current Limitations

The backend currently provides the foundation for application data and document metadata management.

The following capabilities are not implemented yet:

- Complete authentication and authorization.
- Server-derived organization context.
- Redis-backed session management.
- Physical document upload and storage.
- Document text extraction and processing.
- Background processing.
- Embedding generation and vector search.
- RAG pipelines and LLM integrations.
- AI chat and agent workflows.
- Production deployment and observability.

These capabilities will be introduced in future development milestones.

---

## Planned Development

The backend roadmap includes:

1. Authentication and authorization.
2. Secure session management and Redis integration.
3. Server-side organization context and membership verification.
4. Document upload and storage.
5. Document processing and text extraction.
6. Background processing workflows.
7. Embeddings and semantic search.
8. RAG and AI-powered chat.
9. Agent and MCP integrations.
10. Production deployment and observability.
