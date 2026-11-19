# AI Knowledge Hub

AI Knowledge Hub is a full-stack application designed to help users organize, manage, and interact with their knowledge.

The project aims to evolve into an AI-powered knowledge workspace where users can manage documents, explore information, and get context-aware answers using AI.

It is built as a long-term portfolio project with a focus on maintainable architecture, type safety, modular design, and production-oriented development practices.

**Status:** Active development. The Next.js frontend foundation and NestJS backend API are implemented. The backend includes session-based authentication, organization-scoped document operations, PostgreSQL persistence, and Redis-backed session management. Document upload, processing, and AI-powered capabilities remain on the roadmap.

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

### Infrastructure and Development Tools

- Docker
- Docker Compose
- Vitest
- Oxlint
- TypeScript tooling

Additional technologies will be introduced when required by specific project capabilities.

---

## Architecture

AI Knowledge Hub consists of two independently runnable applications:

- **Frontend** — Next.js application responsible for the user interface and frontend application logic.
- **Backend** — NestJS REST API responsible for authentication, domain operations, business logic, and persistent data.

PostgreSQL is the primary relational database for persistent application data. Redis is used as an ephemeral store for server-side sessions.

The architecture follows a modular approach, separating application features, shared functionality, API responsibilities, and infrastructure concerns.

### High-Level Architecture

```text
                         AI Knowledge Hub
                                |
                 +--------------+--------------+
                 |                             |
              Frontend                       Backend
              Next.js                        NestJS
                 |                             |
        +--------+--------+       +------------+-------------+
        |        |        |       |            |             |
     Dashboard Documents Chat   Auth         Users      Organizations
        |                          |            |             |
     Settings                  Security     Documents    Memberships
        |                          |
     Profile                  Redis Sessions
     (planned)                     |
                              PostgreSQL
```

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
│   ├── src/
│   ├── test/
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

The frontend uses feature-oriented organization, while the backend follows NestJS modular architecture.

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

### 3. Configure Environment

Create the local Docker environment file:

```bash
cp .env.docker.example .env.docker
```

Configure the PostgreSQL and Redis connection settings and credentials in `.env.docker`.

The environment file contains local development configuration and must not be committed.

### 4. Start Infrastructure

From the repository root:

```bash
docker compose --env-file .env.docker up -d
```

This starts the PostgreSQL and Redis services defined in Docker Compose.

Check their status:

```bash
docker compose --env-file .env.docker ps
```

### 5. Start the Backend

In a separate terminal:

```bash
cd backend
npm run start:dev
```

Backend URL:

```text
http://localhost:3001
```

The API is available under the `/api` prefix.

### 6. Start the Frontend

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
- Initial authentication-related frontend foundation.

#### Backend

- NestJS backend foundation.
- PostgreSQL integration through Docker Compose.
- Redis integration through Docker Compose.
- Prisma database integration and initial data model.
- Users and Organizations modules.
- User registration and login.
- Argon2id password hashing and verification.
- Server-side session management using Redis.
- HttpOnly session cookie with a seven-day TTL.
- Logout and current-user endpoints.
- Authentication guard for protected routes.
- Server-derived organization context based on authenticated user memberships.
- Documents CRUD API.
- Organization-scoped document operations.
- Pagination, filtering, and sorting.
- DTO-based request validation.
- Standardized API error handling.
- Unit tests and HTTP integration tests for authentication and document operations.

### Planned

- Frontend-to-backend integration across application features.
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
- **Secure defaults** — validate external input, hash passwords, use server-side sessions, and avoid trusting client-supplied authorization context.
- **Maintainability** — prefer straightforward solutions over premature abstractions.
- **Practical engineering** — introduce tools and technologies when there is a concrete architectural or product requirement.

---

## Documentation

- [`README.md`](README.md) — project overview, architecture, setup, and roadmap.
- [`backend/README.md`](backend/README.md) — backend architecture, environment configuration, database setup, authentication, and development commands.

Additional technical documentation will be introduced as the application grows and architectural decisions require a more detailed explanation.
