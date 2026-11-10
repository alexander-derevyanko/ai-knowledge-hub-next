# AI Knowledge Hub

**AI-powered personal knowledge management platform**

AI Knowledge Hub is a full-stack web application designed to help users collect, organize, manage, and interact with their knowledge using AI-powered capabilities.

The project is being built as a practical full-stack application, combining a modern frontend architecture with a dedicated backend and future AI integrations.

The main goal is to create a centralized workspace where users can manage documents, explore their content, communicate with an AI assistant, and eventually retrieve relevant information from their personal knowledge base.

The project is also an ongoing engineering project focused on exploring and applying modern React, Next.js, Node.js, NestJS, and AI integration patterns.

---

## Project Vision

The idea behind AI Knowledge Hub is to build a personal knowledge workspace that goes beyond traditional document storage.

Users should be able to:

- Upload and manage documents in one place.
- Organize knowledge by categories and metadata.
- Search, filter, and browse their knowledge base.
- Interact with an AI assistant through a chat interface.
- Ask questions about their documents and receive context-aware answers.
- Manage their account and application settings.
- Access their knowledge through a secure authentication system.

### Planned AI capabilities

The long-term vision includes:

- AI-powered document processing and content extraction.
- Semantic search across uploaded documents.
- Retrieval-Augmented Generation (RAG).
- Context-aware conversations based on personal knowledge.
- AI-generated summaries and insights.
- Document-based question answering.

These capabilities are part of the product roadmap and are not yet implemented.

---

## Tech Stack

### Frontend

| Technology              | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| React 19                | UI library                                         |
| Next.js 16 (App Router) | Full-stack React framework and application routing |
| TypeScript              | Static typing                                      |
| CSS                     | Styling                                            |
| React Hook Form         | Form state management and validation               |
| Sonner                  | Toast notifications                                |

### Frontend architecture and concepts

- Next.js App Router
- Server Components and Client Components
- Nested layouts and route groups
- Dynamic routing
- Server-side data fetching
- Loading and error boundaries
- Metadata and SEO configuration
- Cache Components and cache revalidation
- Authentication architecture with HttpOnly cookies
- Data Access Layer (DAL)
- Next.js Proxy for preliminary route protection
- Feature-based architecture
- Reusable shared components and utilities

### Backend — planned

| Technology                   | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| Node.js                      | JavaScript runtime                         |
| NestJS                       | Backend framework                          |
| TypeScript                   | Static typing                              |
| REST API                     | Frontend/backend communication             |
| Database and ORM             | Persistent data storage                    |
| Session-based authentication | User authentication and session management |

The backend stack and database implementation will be finalized during the backend development phase.

### AI — planned

AI capabilities will be introduced as a separate part of the system architecture, with the goal of integrating document processing, semantic retrieval, and context-aware AI interactions.

---

## Application Structure

The application currently includes the following main areas:

| Route             | Description                 |
| ----------------- | --------------------------- |
| `/dashboard`      | Main workspace and overview |
| `/documents`      | Document management         |
| `/documents/[id]` | Document details            |
| `/chat`           | AI assistant interface      |
| `/settings`       | Application settings        |
| `/login`          | Authentication entry point  |

The application uses Next.js route groups to separate authenticated and unauthenticated areas without introducing unnecessary URL segments.

---

## Architecture

The frontend follows a feature-based architecture with clear separation of responsibilities.

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── chat/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── proxy.ts
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── dashboard/
│   ├── documents/
│   ├── chat/
│   └── settings/
│
└── shared/
    ├── api/
    ├── components/
    │   ├── layout/
    │   └── ui/
    ├── data/
    ├── types/
    └── utils/
```

### Architectural principles

**App layer (`app/`)**

Responsible for routing, layouts, route-level loading and error handling, metadata, and composition of application features.

**Feature layer (`features/`)**

Contains domain-specific functionality, including UI components, API methods, business logic, and types belonging to individual features.

**Shared layer (`shared/`)**

Contains reusable components, common utilities, shared API infrastructure, application-wide types, and data used by multiple features.

### Dependency direction

```text
app
 ↓
features
 ↓
shared
```

The shared layer must remain independent of application-specific features and routing.

This structure is intended to keep the application maintainable and make future backend integration easier.

---

## Authentication Architecture

The authentication system is currently prepared on the frontend side.

The intended authentication flow is based on backend-managed sessions and HttpOnly cookies.

### Planned authentication flow

1. The user submits login credentials.
2. The frontend sends them to the backend.
3. The backend validates credentials and creates a session.
4. The backend sets an HttpOnly session cookie.
5. The frontend retrieves the authenticated user through the `/auth/me` endpoint.
6. Protected application routes verify the authenticated user.
7. Logout invalidates the session on the backend.

### Current implementation

- Login form with React Hook Form.
- Authentication API interface.
- Authentication-related TypeScript contracts.
- Server-side session cookie access.
- Data Access Layer structure for retrieving the current user.
- Next.js Proxy for preliminary route protection.
- Protected and unauthenticated route layouts.
- Logout UI and notification handling.

**Important:** Real authentication is not yet connected to a backend. API methods are currently placeholders. Cookie creation, session validation, and session invalidation will be implemented in the NestJS backend phase.

The Proxy is not considered a security boundary. Actual authentication and authorization must be enforced by the backend.

---

## Development Progress

The project is being developed incrementally, with each stage introducing new concepts and extending the existing application.

### Week 1 — React + TypeScript

**Status: Completed**

Built the initial application using Vite, React, and TypeScript.

Main areas covered:

- React fundamentals and component architecture.
- Props, state, and component composition.
- Custom hooks.
- Forms and user interactions.
- Data management and reusable components.
- Application feature organization.
- Basic testing.
- Initial MVP implementation.

The first version established the core application functionality and served as the foundation for the Next.js migration.

### Week 2 — Next.js

**Status: Completed**

Migrated the application from Vite to Next.js and introduced the App Router architecture.

Main areas covered:

- Next.js project setup and configuration.
- App Router and route groups.
- Nested layouts and dynamic routes.
- Server Components and Client Components.
- Server-side data fetching.
- Loading, error, and not-found handling.
- Cache Components and cache revalidation.
- Metadata and SEO.
- Authentication architecture.
- Login and logout UI.
- Session cookie handling and Data Access Layer.
- Proxy-based preliminary route protection.
- Production build and code quality checks.

The frontend is now structured to support future integration with a dedicated backend.

### Week 3 — NestJS Backend

**Status: Planned / Next**

The next stage focuses on building the backend.

Planned topics:

- NestJS fundamentals.
- Modules, Controllers, Providers, and Dependency Injection.
- REST API architecture.
- DTOs, validation, and pipes.
- Exception handling.
- Database integration and ORM.
- User management.
- Authentication and session management.
- Protected endpoints and authorization.
- Integration with the Next.js frontend.

### Future stages — AI Integration

Planned development:

- Document upload and processing.
- Text extraction and indexing.
- AI integration.
- Embeddings and vector search.
- Retrieval-Augmented Generation (RAG).
- Context-aware AI chat.
- Document-based question answering.

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended).
- npm.

### Installation

Clone the repository:

```bash
git clone https://github.com/alexander-derevyanko/ai-knowledge-hub-next
cd ai-knowledge-hub-next
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start development server      |
| `npm run build`        | Create production build       |
| `npm run start`        | Start production server       |
| `npm run lint`         | Run ESLint                    |
| `npm run lint:fix`     | Fix lint issues automatically |
| `npm run format`       | Format source files           |
| `npm run format:check` | Check formatting              |
| `npm run typecheck`    | Run TypeScript type checking  |

---

## Current Project Status

**Frontend foundation completed. Backend development is the next milestone.**

The current application has a working frontend structure, navigation, core feature interfaces, document management UI, and authentication architecture.

Some data and API operations are still mocked or represented by placeholders. Persistent storage, real authentication, backend endpoints, and AI-powered functionality remain part of the upcoming development stages.

The project is evolving from a frontend MVP into a full-stack AI-powered knowledge management platform.

---

## Engineering Goals

Beyond building the product itself, this project focuses on practical engineering skills:

- Designing scalable frontend and backend architectures.
- Applying modern React and Next.js patterns.
- Understanding server-side rendering and React Server Components.
- Building REST APIs with NestJS.
- Implementing secure authentication and authorization.
- Working with databases and data modeling.
- Integrating AI services into real-world applications.
- Maintaining clean code, clear boundaries, and testable components.

---

**AI Knowledge Hub — one place to collect, organize, and interact with your knowledge.**
