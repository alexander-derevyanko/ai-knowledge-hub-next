# AI Knowledge Hub — Backend

The backend is an independent REST API application for AI Knowledge Hub, built with NestJS, TypeScript, Prisma ORM, PostgreSQL, and Redis.

It provides the server-side foundation for application features, handling authentication, domain operations, business logic, and persistent data.

The backend is designed around modular architecture, clear separation of responsibilities, and incremental development.

**Status:** The backend foundation is implemented, including database integration, user and organization management, session-based authentication, Redis-backed sessions, organization-scoped document operations, request validation, and standardized error handling.

---

## Technology Stack

- Node.js 24
- NestJS 12
- TypeScript
- PostgreSQL 17
- Prisma ORM 7
- `@prisma/adapter-pg`
- Redis 8
- `class-validator`
- `class-transformer`
- Argon2id
- Vitest
- Oxlint

The application uses ECMAScript modules (ESM) and TypeScript `NodeNext` module resolution.

---

## Architecture

The backend follows NestJS modular architecture.

Its main responsibilities include:

- Handling HTTP requests and responses.
- Authenticating users and managing server-side sessions.
- Validating incoming data.
- Implementing application and domain logic.
- Managing persistent data through Prisma.
- Enforcing organization-scoped data operations.
- Managing session data through Redis.
- Providing shared infrastructure for error handling and database access.

### Project Structure

```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   ├── enums.prisma
│   ├── user.prisma
│   ├── organization.prisma
│   ├── document.prisma
│   └── seed.ts
│
├── src/
│   ├── auth/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   └── types/
│   ├── common/
│   │   ├── filters/
│   │   └── interfaces/
│   ├── database/
│   ├── documents/
│   │   └── dto/
│   ├── health/
│   ├── organizations/
│   │   └── utils/
│   ├── redis/
│   ├── security/
│   ├── users/
│   ├── generated/
│   │   └── prisma/
│   ├── app.module.ts
│   ├── configure-app.ts
│   └── main.ts
│
├── test/
│   ├── helpers/
│   ├── auth.e2e-spec.ts
│   └── documents.e2e-spec.ts
│
├── prisma7.config.ts
├── package.json
└── README.md
```

### Module Responsibilities

| Module                | Responsibility                                                                |
| --------------------- | ----------------------------------------------------------------------------- |
| `AuthModule`          | Registration, login, logout, current-user retrieval, and authentication guard |
| `SecurityModule`      | Password hashing and verification                                             |
| `UsersModule`         | User data operations                                                          |
| `OrganizationsModule` | Organizations, memberships, and organization context resolution               |
| `DocumentsModule`     | Document metadata operations                                                  |
| `PrismaModule`        | Database connection and Prisma integration                                    |
| `RedisModule`         | Redis connection and session storage                                          |
| `HealthModule`        | Application health check                                                      |
| `common/`             | Shared application infrastructure, including HTTP exception handling          |

Controllers handle HTTP concerns, DTOs validate incoming requests, services contain application logic, and Prisma provides database access.

---

## Authentication and Sessions

The backend uses server-side session-based authentication.

The browser receives an opaque session identifier in an HttpOnly cookie. Session data is stored on the server in Redis.

The session identifier does not contain user information or authorization claims. The backend resolves the session through Redis and retrieves the authenticated user from PostgreSQL.

### Authentication Flow

1. A user registers with name, email, password, and organization name.
2. The backend hashes the password using Argon2id.
3. The backend creates the user, organization, and OWNER membership.
4. The user logs in with email and password.
5. The backend verifies the password and creates a session in Redis.
6. The session identifier is sent to the browser through an HttpOnly cookie.
7. Protected endpoints resolve the session and load the authenticated user.
8. Logout deletes the Redis session and clears the cookie.

### Session Cookie

The session cookie is configured with:

- `HttpOnly`
- `SameSite=Lax`
- `Path=/`
- Seven-day maximum age
- `Secure` enabled in production

The session data is stored in Redis with a matching seven-day TTL.

### Authentication Endpoints

All endpoints use the global `/api` prefix.

| Method | Endpoint             | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| `POST` | `/api/auth/register` | Register a user and create an organization       |
| `POST` | `/api/auth/login`    | Verify credentials and create a session          |
| `GET`  | `/api/auth/me`       | Retrieve the currently authenticated user        |
| `POST` | `/api/auth/logout`   | Destroy the current session and clear the cookie |

Registration and login are separate operations. Registering an account does not automatically create a login session.

### Route Protection

`AuthGuard` protects endpoints that require authentication.

The guard:

1. Reads the session cookie from the request.
2. Resolves the session through `SessionService`.
3. Retrieves the authenticated user and memberships.
4. Attaches the user context to the request.
5. Rejects requests with missing or invalid sessions.

The `CurrentUser` decorator provides the authenticated user context to controllers.

---

## Multi-Tenancy and Organization Context

The application supports users belonging to organizations through organization memberships.

Organization-owned document operations are scoped by the authenticated user's memberships.

The backend resolves the organization context server-side:

- If the user belongs to one organization, that organization is selected automatically.
- If the user belongs to multiple organizations, the client must specify the desired organization through the `x-organization-id` header.
- The requested organization must belong to the authenticated user.
- A client-supplied `organizationId` in a document body or query parameter is not accepted as an authorization source.

The organization identifier used by document services is derived from the authenticated user context and validated membership.

This prevents clients from selecting organizations to which they do not belong.

---

## Getting Started

### Prerequisites

- Node.js 24.x
- npm
- Docker with Docker Compose

PostgreSQL and Redis are provided through the repository's Docker Compose configuration.

### 1. Install Dependencies

From the repository root:

```bash
cd backend
npm install
```

### 2. Configure Environment

The local infrastructure environment configuration is maintained in the repository root.

From the repository root:

```bash
cp .env.docker.example .env.docker
```

Configure the database credentials and connection settings, as well as the Redis connection URL, in `.env.docker`.

The backend and Prisma configuration load this environment configuration during local development.

The `.env.docker` file contains local credentials and must not be committed.

### 3. Start Infrastructure

From the repository root:

```bash
docker compose --env-file .env.docker up -d
```

Check the services:

```bash
docker compose --env-file .env.docker ps
```

The default local configuration exposes:

- PostgreSQL on `127.0.0.1:5432`
- Redis on `127.0.0.1:6379`

The database and Redis use named Docker volumes to persist their respective data between container restarts.

Stop the services:

```bash
docker compose --env-file .env.docker down
```

**Warning:** Using `docker compose down -v` removes named volumes and deletes local persistent data.

### 4. Initialize the Database

Run commands from `backend/`.

Apply development migrations:

```bash
npm run prisma:migrate:dev
```

Generate the Prisma Client:

```bash
npm run prisma:generate
```

Populate development data:

```bash
npm run prisma:seed
```

The Prisma Client is generated under:

```text
src/generated/prisma/
```

Generated files should not be edited manually.

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

Prisma ORM provides database access, schema management, migrations, and client generation.

The current data model covers:

- Users
- Organizations
- Organization memberships
- Document metadata

### Prisma Schema Organization

The Prisma schema uses a multi-file structure:

```text
prisma/
├── schema.prisma
├── enums.prisma
├── user.prisma
├── organization.prisma
├── document.prisma
├── seed.ts
└── migrations/
```

Responsibilities:

- `schema.prisma` — Prisma Client generator and datasource configuration.
- `enums.prisma` — shared database enums.
- `user.prisma` — user model.
- `organization.prisma` — organization and membership models.
- `document.prisma` — document metadata model.
- `seed.ts` — development seed data.
- `migrations/` — versioned database migrations.

The Prisma configuration is maintained in `prisma7.config.ts`.

### Database Naming Conventions

The project uses separate naming conventions for Prisma's application-level API and physical PostgreSQL objects.

| Database concept | Prisma naming       | PostgreSQL naming             |
| ---------------- | ------------------- | ----------------------------- |
| Models / tables  | PascalCase singular | lowercase plural `snake_case` |
| Fields / columns | `camelCase`         | `snake_case`                  |
| Enum types       | PascalCase          | lowercase `snake_case`        |
| Enum values      | UPPERCASE           | UPPERCASE                     |

Examples:

| Prisma               | PostgreSQL             |
| -------------------- | ---------------------- |
| `User`               | `users`                |
| `OrganizationMember` | `organization_members` |
| `passwordHash`       | `password_hash`        |
| `createdAt`          | `created_at`           |
| `OrganizationRole`   | `organization_role`    |

Prisma mapping attributes connect these naming conventions:

- `@map("column_name")` maps a Prisma field to a physical PostgreSQL column.
- `@@map("table_name")` maps a Prisma model to a physical PostgreSQL table.
- `@@map("enum_name")` maps a Prisma enum to a physical PostgreSQL enum type.

This allows application code to use idiomatic TypeScript naming while keeping database objects consistent with PostgreSQL conventions.

### Prisma Commands

Run commands from `backend/`.

| Command                             | Purpose                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `npm run prisma:generate`           | Generate Prisma Client                                |
| `npm run prisma:format`             | Format Prisma schema files                            |
| `npm run prisma:validate`           | Validate the Prisma schema                            |
| `npm run prisma:migrate:dev`        | Create and apply a development migration              |
| `npm run prisma:migrate:dev:create` | Create a migration without applying it                |
| `npm run prisma:migrate:deploy`     | Apply pending migrations in deployment environments   |
| `npm run prisma:migrate:status`     | Check migration status                                |
| `npm run prisma:seed`               | Execute the development seed                          |
| `npm run prisma:studio`             | Open Prisma Studio                                    |
| `npm run prisma:migrate:reset`      | Reset the development database and reapply migrations |

### Creating a Migration

For a normal development migration:

```bash
npm run prisma:migrate:dev -- --name add_new_feature
```

Prisma creates a migration based on the schema changes and applies it to the development database.

When a migration needs manual SQL review or editing, create it without applying it:

```bash
npm run prisma:migrate:dev:create -- --name add_new_feature
```

Review the generated SQL under `prisma/migrations/` before applying it.

After reviewing or editing the migration:

```bash
npm run prisma:migrate:dev
```

For deployment environments, apply already-created migrations with:

```bash
npm run prisma:migrate:deploy
```

Do not use `migrate dev` as a production deployment command.

**Warning:** `prisma:migrate:reset` is destructive. It drops and recreates the development database, reapplies migrations, and runs the seed. Do not use it when existing local data must be preserved.

### Development Seed

The project includes development seed data for the initial user, organization, membership, and documents.

The seed is designed to be idempotent, so it can be executed repeatedly without creating duplicate seed records.

Seeded credentials are development data only. The placeholder password hash is not a valid login credential and cannot be used to authenticate through the login endpoint.

---

## Redis and Session Storage

Redis is used as an ephemeral session store.

Session records contain the user identifier and session creation timestamp. Each session has a seven-day TTL.

The session store is accessed through `SessionService`, while `RedisService` encapsulates the Redis client connection and basic operations.

For local development, the backend connects to Redis through:

```text
redis://localhost:6379
```

When the backend is eventually run inside Docker Compose, the Redis connection should use the Compose service hostname rather than `localhost`.

PostgreSQL remains the persistent source of truth for users, organizations, memberships, and document metadata. Redis is not used as a replacement for the relational database.

---

## API Overview

The backend exposes a REST API under the `/api` prefix.

Current functional areas include:

- Health checks.
- Authentication and session management.
- User-related operations.
- Organization and membership operations.
- Document metadata management.

The Documents API supports:

- Creating document metadata.
- Listing documents.
- Retrieving a document by ID.
- Updating document metadata.
- Deleting document metadata.
- Pagination, filtering, and sorting.
- Organization-scoped access.

The API currently manages document metadata only. Physical file upload, file storage, text extraction, and AI processing are not implemented.

### Request Validation

Incoming requests are validated through DTOs and the global NestJS `ValidationPipe`.

The validation configuration rejects unknown properties and transforms incoming values where applicable.

### Error Handling

A global HTTP exception filter provides a consistent API error response structure.

Validation errors include a `VALIDATION_ERROR` code and field-level details. Other application errors use specific codes where defined, such as `INVALID_CREDENTIALS`, `INVALID_SESSION`, `EMAIL_ALREADY_EXISTS`, and `DOCUMENT_NOT_FOUND`.

Unexpected internal errors are returned without exposing implementation details.

---

## Testing

The backend uses Vitest for unit and HTTP integration tests.

### Unit Tests

Unit tests verify individual services, guards, and other components in isolation using test doubles where appropriate.

Run unit tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:cov
```

The current unit test suite contains 59 tests.

### HTTP Integration Tests

HTTP integration tests run the NestJS application and exercise real HTTP endpoints. Prisma and Redis are replaced with test doubles, so the tests do not require live infrastructure.

The current HTTP integration coverage includes:

- Authentication registration, login, current-user retrieval, and logout.
- Session cookie lifecycle.
- Invalid credentials and validation errors.
- Documents CRUD operations.
- Authentication requirements for protected document endpoints.
- Organization membership validation and tenant isolation.
- `DOCUMENT_NOT_FOUND` behavior for inaccessible or missing documents.

Run the HTTP integration tests:

```bash
npm run test:e2e
```

The current HTTP integration test suite contains 28 tests.

**Terminology note:** The test files use the `*.e2e-spec.ts` naming convention and the `test:e2e` script, but the current tests are HTTP integration tests because PostgreSQL and Redis are mocked. Full end-to-end tests against real PostgreSQL and Redis infrastructure remain a future testing milestone.

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

Validate the Prisma schema:

```bash
npm run prisma:validate
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Check migration status:

```bash
npm run prisma:migrate:status
```

Apply development migrations:

```bash
npm run prisma:migrate:dev
```

Apply existing migrations in deployment environments:

```bash
npm run prisma:migrate:deploy
```

Run the development seed:

```bash
npm run prisma:seed
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

---

## Current Limitations

The backend currently provides authentication, session management, organization-scoped access, and document metadata management.

The following capabilities are not implemented yet:

- Frontend-to-backend integration across all application features.
- User profile and account management.
- Advanced organization and workspace management.
- Physical document upload and storage.
- Document text extraction and processing.
- Background processing workflows.
- Embedding generation and vector search.
- RAG pipelines and LLM integrations.
- AI chat and agent workflows.
- MCP integrations.
- Full end-to-end tests against real PostgreSQL and Redis infrastructure.
- Production deployment and observability.

The current authentication implementation provides server-side sessions and protected API routes. Additional security measures and production hardening may be introduced as deployment requirements become clearer.

---

## Planned Development

The backend roadmap includes:

1. Frontend-to-backend integration.
2. User profile and account management.
3. Document upload and storage.
4. Document processing and text extraction.
5. Background processing workflows.
6. Embeddings and semantic search.
7. RAG and AI-powered chat.
8. Agent and MCP integrations.
9. Full end-to-end testing with real infrastructure.
10. Production deployment and observability.
