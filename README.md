# AI Knowledge Hub

AI Knowledge Hub is a full-stack application designed to help users organize, manage, and interact with their knowledge.

The project aims to evolve into an AI-powered knowledge workspace where users can manage documents, explore information, and get context-aware answers using AI.

It is built as a long-term portfolio project with a focus on maintainable architecture, type safety, modular design, and production-oriented development practices.

**Status:** Active development. The Next.js frontend foundation and NestJS backend API are implemented. The backend includes session-based authentication, organization-scoped document operations, PostgreSQL persistence, and Redis-backed session management. Frontend authentication is integrated with the backend, including registration with automatic login, login, logout, and protected application routes. Documents are integrated with the backend through the Next.js BFF. Physical file upload, document processing, and AI-powered capabilities remain on the roadmap.

---

## Overview

The application is organized around several core functional areas:

- **Dashboard** — an overview of the user's knowledge workspace.
- **Documents** — document organization and metadata management.
- **Chat** — an interface for interacting with the knowledge base.
- **Settings** — application and workspace configuration.
- **Profile** — planned user profile and account management functionality.

The long-term goal is to connect these areas into a unified experience powered by document processing, semantic search, and AI.

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- App Router
- CSS Modules
- ESLint
- Prettier

### Backend

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- `class-validator`
- `class-transformer`
- Argon2id for password hashing
- Vitest
- Oxlint

### Infrastructure and Development Tools

- Docker
- Docker Compose
- npm
- Git
- TypeScript tooling

Additional technologies will be introduced when required by specific project capabilities.

---

## Architecture

AI Knowledge Hub consists of two independently runnable applications:

- **Frontend** — Next.js application responsible for the user interface, routing, server-side rendering, and the Backend-for-Frontend (BFF) layer.
- **Backend** — NestJS REST API responsible for authentication, domain operations, business logic, authorization, and persistent data.

PostgreSQL is the primary relational database for persistent application data. Redis is used as an ephemeral store for server-side sessions.

The architecture follows a modular approach, separating application features, shared functionality, API responsibilities, and infrastructure concerns.

### High-Level Architecture

```text
                         AI Knowledge Hub
                                |
                 +--------------+--------------+
                 |                             |
              Frontend                      Backend
              Next.js                       NestJS
                 |                             |
          +------+-------+             +-------+-------+
          |              |             |               |
       Browser       Server          Auth           Domain
          |              |             |               |
       Next.js BFF       |             |          Documents
          |              |             |               |
          +--------------+-------------+---------------+
                         |
                    PostgreSQL
                         |
                   Redis Sessions
```

### Frontend and Backend Communication

The frontend uses two communication patterns:

- **Browser-to-backend through BFF:** Browser requests for the Documents feature go through explicit Next.js Route Handlers. The BFF forwards requests to NestJS and returns the backend response to the browser.
- **Server-to-backend:** Next.js Server Components and server-side application logic communicate with NestJS directly through a server-only HTTP client. Session cookies are forwarded where authentication is required.

The Documents feature has been migrated to the BFF approach.

Authentication currently still uses direct browser-to-backend requests for registration, login, and logout. Migrating these requests to the Next.js BFF is the next integration step.

NestJS remains responsible for authentication, session validation, authorization, business logic, request validation, and tenant isolation. The BFF does not replace backend security or domain logic.

### Data and Infrastructure

- **PostgreSQL** stores users, organizations, memberships, and document metadata.
- **Redis** stores server-side session data with a configured time-to-live.
- **Docker Compose** provides local PostgreSQL and Redis services.
- The backend accesses PostgreSQL through Prisma and Redis through its Redis service.

### Repository Structure

```text
ai-knowledge-hub-next/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── enums.prisma
│   │   ├── user.prisma
│   │   ├── organization.prisma
│   │   ├── document.prisma
│   │   └── seed.ts
│   ├── src/
│   ├── test/
│   ├── prisma7.config.ts
│   ├── package.json
│   └── README.md
│
├── src/
│   ├── app/
│   ├── features/
│   └── shared/
│
├── public/
├── docker-compose.yml
├── .env.docker.example
├── next.config.ts
├── package.json
└── README.md
```

The frontend uses feature-oriented organization, while the backend follows NestJS modular architecture. The Prisma schema is split into multiple files to keep database models and enums organized by domain.

For backend-specific architecture and setup instructions, see [`backend/README.md`](backend/README.md).

---

## Getting Started

### Prerequisites

- Node.js 24.x
- npm
- Docker with Docker Compose
- Git

The project has been developed with Node.js `24.21.0` and npm `11.19.0`.

### 1. Clone the Repository

```bash
git clone https://github.com/alexander-derevyanko/ai-knowledge-hub-next
cd ai-knowledge-hub-next
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

### 3. Configure Infrastructure Environment

Create the local Docker environment file:

```bash
cp .env.docker.example .env.docker
```

Configure the PostgreSQL and Redis connection settings and credentials in `.env.docker`.

The example configuration includes:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `DATABASE_URL`
- `REDIS_URL`

The environment file contains local development configuration and must not be committed.

### 4. Configure Frontend Environment

Create `.env.local` in the repository root:

```bash
touch .env.local
```

Add the backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

The frontend currently uses this URL for direct browser-to-backend authentication requests. Documents requests use the Next.js BFF and do not require the browser to use this URL.

The variable will be removed after authentication is migrated to the BFF.

The `.env.local` file contains local development configuration and must not be committed.

### 5. Start Infrastructure

From the repository root:

```bash
docker compose --env-file .env.docker up -d
```

This starts the PostgreSQL and Redis services defined in Docker Compose.

Check their status:

```bash
docker compose --env-file .env.docker ps
```

### 6. Initialize the Database

From the backend directory:

```bash
cd backend
npm run prisma:migrate:dev
npm run prisma:generate
npm run prisma:seed
```

Existing migrations are applied to the local development database. The Prisma Client is generated, and the development seed populates initial data.

### 7. Start the Backend

From `backend/`, in a separate terminal:

```bash
npm run start:dev
```

Backend URL:

```text
http://localhost:3001
```

The API is available under the `/api` prefix.

### 8. Start the Frontend

From the repository root, in another terminal:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

For database migrations, Prisma configuration, seed information, and backend development commands, see [`backend/README.md`](backend/README.md).

---

## Development Commands

Run frontend commands from the repository root.

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server              |
| `npm run build`        | Build the production application                  |
| `npm run start`        | Start the production application                  |
| `npm run lint`         | Run ESLint                                        |
| `npm run lint:fix`     | Run ESLint and automatically fix supported issues |
| `npm run typecheck`    | Run TypeScript type checking                      |
| `npm run format`       | Format project files with Prettier                |
| `npm run format:check` | Check formatting without modifying files          |

Backend commands are documented in [`backend/README.md`](backend/README.md).

---

## Current Project Status

The project is being developed incrementally, with each milestone introducing a coherent and verifiable set of capabilities.

### Implemented

#### Frontend

- React and TypeScript frontend foundation.
- Next.js App Router migration.
- Application layouts and routing.
- Feature-oriented frontend structure.
- Dashboard, Documents, Chat, and Settings UI foundations.
- Document list and details views.
- Loading, error, and not-found states.
- Document listing, search, filtering, sorting, and pagination integrated with the backend.
- Document metadata creation through the Next.js BFF.
- Server-side document data retrieval.
- User registration and login flows integrated with the NestJS backend.
- Automatic login after successful registration.
- Logout with server-side session invalidation.
- HttpOnly session cookie handling.
- Server-side current-user retrieval through the backend API.
- Protected application routes with Next.js Proxy and server-side authentication checks.

#### Backend

- NestJS backend foundation.
- PostgreSQL integration through Docker Compose.
- Redis integration through Docker Compose.
- Prisma database integration with a multi-file schema.
- PostgreSQL naming conventions using lowercase plural `snake_case` table names, `snake_case` columns, and mapped enum types.
- Database migrations and idempotent development seed.
- Users and Organizations modules.
- User registration with automatic session creation and login.
- Login and logout endpoints.
- Argon2id password hashing and verification.
- Server-side session management using Redis.
- HttpOnly session cookie with a seven-day TTL.
- Current-user endpoint.
- Authentication guard for protected routes.
- Server-derived organization context based on authenticated user memberships.
- Documents CRUD API.
- Organization-scoped document operations.
- Pagination, filtering, and sorting.
- DTO-based request validation.
- Standardized API error handling.
- Unit tests and HTTP integration tests for authentication and document operations.

### In Progress

- Migration of browser-based authentication requests to the Next.js BFF.
- Consolidation of browser-to-backend communication through same-origin Next.js endpoints.

### Planned

- User profile and account management.
- Organization and workspace management improvements.
- Physical document upload and file storage.
- Document text extraction and processing.
- Background processing workflows.
- Embeddings and vector search.
- RAG-based knowledge retrieval.
- AI-powered chat.
- Agent and MCP integrations.
- Production deployment and observability.

---

## Development Approach

The project follows these principles:

- **Incremental development** — implement and verify one capability at a time.
- **Clear separation of concerns** — keep frontend, backend, domain logic, and infrastructure responsibilities distinct.
- **Type safety** — use TypeScript and explicit contracts.
- **Modular architecture** — organize functionality around application domains.
- **Secure defaults** — validate external input, hash passwords, use HttpOnly cookies, and enforce authorization on the backend.
- **Server-side ownership of sensitive operations** — keep session validation, business rules, and tenant isolation in NestJS.
- **Maintainability** — prefer clear and conventional solutions over unnecessary abstractions.

The project is developed in logical milestones. Each milestone includes implementation, verification, documentation updates, and a dedicated Git commit.
