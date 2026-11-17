# AI Knowledge Hub

A full-stack knowledge management platform for collecting, organizing, searching, and interacting with personal and organizational knowledge.

The project is being developed as a long-term engineering and learning project, with a focus on modern frontend and backend architecture, authentication, data management, AI-powered search, and production-oriented infrastructure.

## Project Vision

AI Knowledge Hub is designed to become a workspace where users can:

- Manage documents and organize them by category.
- Work with documents within an organization.
- Search across their knowledge base.
- Ask questions about uploaded documents using AI.
- Get context-aware answers powered by Retrieval-Augmented Generation (RAG).
- Eventually use AI agents and external tools to interact with their knowledge.

The project is being built incrementally. The current implementation focuses on the application foundation, backend architecture, database integration, and authentication infrastructure.

---

## Tech Stack

### Frontend

- React
- Next.js 16 — App Router
- TypeScript
- CSS Modules
- React Hook Form
- Sonner

### Backend

- Node.js
- NestJS 12
- TypeScript
- REST API
- Prisma ORM 7
- PostgreSQL 17
- Redis — planned for session storage
- Vitest
- Oxlint
- Prettier

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL running in Docker
- Redis — planned
- Containerized frontend and backend — planned

### AI — Planned

- LLM integration
- Embeddings
- Vector search
- Retrieval-Augmented Generation (RAG)
- AI agents
- MCP integration

---

## Architecture

The project is organized as a frontend application and an independently structured backend application.

```text
ai-knowledge-hub-next/
├── src/                         # Next.js frontend
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (main)/
│   │   ├── layout.tsx
│   │   └── ...
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── chat/
│   │   └── settings/
│   └── shared/
│       ├── api/
│       ├── components/
│       ├── data/
│       ├── types/
│       └── utils/
│
├── backend/                     # NestJS application
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── health/
│   │   ├── users/
│   │   ├── organizations/
│   │   ├── documents/
│   │   ├── generated/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── ...
│
├── docker-compose.yml
├── .env.docker.example
└── README.md
```

The generated Prisma client is not committed to Git. It is generated from the Prisma schema.

### Architectural principles

- Frontend and backend are separate applications with independent responsibilities.
- The backend owns business logic, persistence, and data access.
- PostgreSQL is the primary persistent database.
- Redis will be used for ephemeral session storage.
- Document operations are scoped by organization.
- Authentication and authorization will be enforced by the backend.
- The frontend and backend will eventually run as separate Docker services.
- External services and infrastructure are accessed through clear application boundaries.

---

## Application Features

### Frontend

Current application routes:

| Route             | Description          |
| ----------------- | -------------------- |
| `/login`          | Authentication page  |
| `/dashboard`      | Dashboard            |
| `/documents`      | Documents list       |
| `/documents/[id]` | Document details     |
| `/chat`           | AI chat workspace    |
| `/settings`       | Application settings |

The frontend currently includes the application shell, navigation, document-related UI, forms, loading and error states, and the initial authentication structure.

The frontend authentication flow is prepared architecturally but is not yet connected to a complete backend authentication implementation.

### Backend

Current API base URL:

```text
http://localhost:3001/api
```

Implemented endpoints include:

| Method   | Endpoint         | Description              |
| -------- | ---------------- | ------------------------ |
| `GET`    | `/health`        | Health check             |
| `GET`    | `/documents`     | List documents           |
| `GET`    | `/documents/:id` | Get document             |
| `POST`   | `/documents`     | Create document metadata |
| `PATCH`  | `/documents/:id` | Update document metadata |
| `DELETE` | `/documents/:id` | Delete document metadata |

The Documents API currently supports:

- PostgreSQL persistence through Prisma.
- Organization-scoped document queries and mutations.
- Pagination.
- Filtering by category and status.
- Sorting by creation date, update date, or title.
- Document creation, retrieval, update, and deletion.

**Important:** document records and metadata are stored in PostgreSQL, but actual file upload, binary storage, text extraction, and AI processing have not been implemented yet.

The current Documents API temporarily receives `organizationId` from request parameters or body. This is an educational intermediate implementation, not a secure authorization mechanism. It will be replaced with organization context derived from the authenticated user.

---

## Database

PostgreSQL is the primary persistent data store.

Current Prisma models:

- `User`
- `Organization`
- `OrganizationMember`
- `Document`

The data model supports organization membership and roles (`OWNER`, `ADMIN`, `MEMBER`), as well as organization-scoped documents.

Prisma migrations are used to manage schema changes. A seed script creates a demo organization, user, and owner membership for local development.

### Redis

Redis is planned for authentication session storage.

The intended session architecture:

- The browser stores an opaque session identifier in an HttpOnly cookie.
- Redis stores the corresponding session data with a TTL.
- The backend validates the session on protected requests.
- Logout invalidates the session in Redis.
- A `SessionStore` abstraction keeps authentication logic independent of the storage implementation.

PostgreSQL remains the source of truth for persistent business data. Redis is intended for ephemeral session data.

---

## Infrastructure and Docker

Docker is part of the project's planned runtime architecture.

### Currently implemented

- PostgreSQL 17 runs in Docker Compose.
- PostgreSQL data is persisted in a named Docker volume.
- The database is exposed locally through a loopback-bound port.
- Environment variables are loaded from the root `.env.docker` file.

### Planned

- Dockerfile for the backend.
- Dockerfile for the frontend.
- Redis service.
- Full Docker Compose setup for frontend, backend, PostgreSQL, and Redis.
- Service health checks and startup dependencies.
- Development-friendly container configuration and hot reload.
- Production-oriented container configuration.

The goal is to make all runtime services reproducible through Docker while keeping frontend and backend independently runnable and deployable.

---

## Getting Started

### Prerequisites

- Node.js 24+
- npm
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/alexander-derevyanko/ai-knowledge-hub-next
cd ai-knowledge-hub-next
```

### 2. Configure environment variables

Copy the Docker environment template:

```bash
cp .env.docker.example .env.docker
```

Update the values in `.env.docker`, including PostgreSQL credentials and `DATABASE_URL`.

Do not commit `.env.docker`.

### 3. Start PostgreSQL

From the repository root:

```bash
docker compose --env-file .env.docker up -d postgres
```

Check the container:

```bash
docker compose --env-file .env.docker ps
```

### 4. Start the backend

```bash
cd backend
npm install
npm run prisma:generate
npx prisma migrate dev
npm run start:dev
```

The backend will be available at:

```text
http://localhost:3001/api
```

Health check:

```text
http://localhost:3001/api/health
```

To populate the development database:

```bash
npx prisma db seed
```

### 5. Start the frontend

In a separate terminal, from the repository root:

```bash
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

## Development Progress

The project is developed in stages. Completed items describe implemented functionality; planned items are not yet available in the application.

### Week 1 — React + TypeScript foundation

- Initial Vite application.
- React and TypeScript setup.
- Core application UI.
- Reusable components and hooks.
- Mock document data and frontend interactions.

**Status:** Completed.

### Week 2 — Next.js application architecture

- Migration to Next.js App Router.
- Route groups and layouts.
- Server and Client Components.
- Dynamic routes and navigation.
- Loading, error, and not-found states.
- Metadata and SEO foundation.
- Initial authentication architecture.
- Frontend data-access structure.

**Status:** Completed.

### Week 3 — NestJS backend foundation and database integration

- NestJS application setup and project configuration.
- Modules, controllers, providers, dependency injection, and module boundaries.
- REST API fundamentals and CRUD operations.
- PostgreSQL running through Docker Compose.
- Prisma 7 setup with PostgreSQL driver adapter.
- Database schema and initial migrations.
- Users and Organizations modules.
- Organization membership and roles.
- Database-backed Documents CRUD.
- Organization-scoped document operations.
- Pagination, filtering, and sorting.
- Development database seed.

**Next steps within this stage:**

- DTOs and request validation with `class-validator` and `class-transformer`.
- Global `ValidationPipe`.
- Consistent API error response contract with stable error codes and human-readable messages.
- Exception handling and correct HTTP error responses.
- Password hashing and authentication endpoints.
- Session management using Redis.
- Authentication guards and organization context derived from the authenticated user.

**Status:** In progress.

### Week 4 — Full-stack integration and runtime infrastructure

- Connect the Next.js frontend to the real NestJS API.
- Replace remaining mock document data with backend requests.
- Complete cookie-based authentication integration.
- Implement authenticated server-side data access.
- Add Redis to Docker Compose.
- Add frontend and backend Dockerfiles.
- Run frontend, backend, PostgreSQL, and Redis through Docker Compose.
- Configure local development workflows and service health checks.

**Status:** Planned.

### Week 5 — Document file lifecycle

- File upload API.
- File validation and metadata handling.
- Storage abstraction.
- Local or external object storage integration.
- Document processing lifecycle.
- Text extraction from supported formats.
- Processing status and error handling.

**Status:** Planned.

### Week 6 — Search and AI foundation

- Embeddings generation.
- Vector storage and similarity search.
- Document chunking.
- Retrieval-Augmented Generation (RAG).
- Context-aware chat with documents.
- LLM integration.

**Status:** Planned.

### Future stages — AI capabilities and production readiness

- AI agents and tool calling.
- MCP integration.
- Advanced search and knowledge workflows.
- Automated tests and end-to-end coverage.
- Logging, monitoring, and observability.
- Security hardening.
- Deployment and production infrastructure.

**Status:** Planned.

---

## Engineering Goals

The project is also used to explore and apply practical engineering concepts:

- Modular application architecture.
- Clean separation of responsibilities.
- Type-safe API contracts.
- Database modeling and migrations.
- Multi-tenant data isolation.
- Authentication and authorization.
- Session lifecycle and security.
- Containerization and reproducible environments.
- Error handling and validation.
- Testing and maintainability.
- AI integration and RAG architecture.

The roadmap may evolve as implementation decisions and technical requirements become clearer.
