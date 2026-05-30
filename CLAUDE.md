# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klinik Aulia Sehat - a clinic queue management system with patient reservations, queue tracking, dashboard analytics, and realtime queue display. Backend is Laravel (separate repo), this is the React frontend.

## Commands

```bash
bun dev          # Start Vite dev server
bun run build    # TypeScript check + Vite build
bun run lint     # Run ESLint
```

No test framework is configured.

## Tech Stack

- React 19 + TypeScript + Vite 7
- TanStack Router (file-based routing with `@tanstack/router-plugin`)
- TanStack Query (server state, 5min default staleTime, 1 retry)
- Zustand (auth + locale stores with localStorage persistence)
- Zod v4 + React Hook Form (form validation)
- Tailwind CSS 4 + shadcn/ui components
- Axios (API client with auth interceptors)
- i18next (Indonesian `id` default + English `en`)
- Laravel Echo + Pusher.js (realtime via Laravel Reverb)
- Recharts (dashboard charts)

## Architecture

### Routing

File-based routing via TanStack Router plugin (`src/routes/`). Route files export a `Route` via `createFileRoute()`. The route tree is auto-generated in `src/routeTree.gen.ts`.

Route guards in `__root.tsx`: unauthenticated users redirect to `/login`, role-based access checked via `canAccessRoute()` from `src/lib/roles.ts`.

### Data Flow Pattern

Each domain follows a consistent 3-layer pattern:

1. **Service** (`src/services/*.ts`): API calls using the shared Axios instance, exports an object with async methods
2. **Hook** (`src/hooks/use-*.ts`): TanStack Query hooks wrapping services. Query keys are organized as `const` objects (e.g., `queueKeys.list()`). Mutations invalidate related query keys on success.
3. **Types** (`src/types/api.ts`): All API request/response interfaces in one file

### State Management

- `src/stores/auth.ts`: Zustand store with `persist` middleware for auth token/user
- `src/stores/locale.ts`: Language preference store
- Axios interceptor in `src/lib/axios.ts` reads token from auth store and handles 401s

### Role-Based Access

Six roles defined in `src/lib/roles.ts`: Superadmin, Kepala Klinik, Dokter, Perawat Anamnesa, Perawat Asisten, Administrasi. Each role has allowed route patterns. `ROLE_DEFAULT_ROUTE` maps post-login redirects.

### i18n

Namespaces in `src/lib/i18n/resources/{id,en}/`. Default language is Indonesian (`id`). Translation keys use `namespace:key` format (e.g., `t("dashboard:page.title")`). Date formatting uses `date-fns` with locale-aware formatters in `src/lib/i18n/date-locale.ts`.

### Path Alias

`@/` maps to `src/` (configured in `vite.config.ts`).

### API Configuration

Base URL from `VITE_API_BASE_URL` env var. Realtime via `VITE_REVERB_*` env vars. See `.env.example` for all variables.

### Key UI Patterns

- `DataTable` component (`src/components/data-table/`) for CRUD tables with pagination, search, and actions
- `ConfirmDialog` for delete/restore confirmations
- `LoadingSpinner` from `src/components/ui/loading-spinner.tsx`
- Error messages via `getApiErrorMessage()` from `src/lib/api-error.ts`
- Toast notifications via `sonner`
