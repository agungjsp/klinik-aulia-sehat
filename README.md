# Klinik Aulia Sehat

Frontend for a clinic queue management system. Handles patient reservations, queue tracking, realtime queue display, dashboard analytics, and role-based access for clinic staff.

## Features

- **Queue Management** — Create reservations, call next patients, track queue status across multiple poli (clinics)
- **Realtime Display** — Live queue board via Laravel Reverb (WebSocket) for waiting areas
- **Dashboard** — Reservation trends, patient attendance rates, peak hours, BPJS vs general breakdown
- **Reports** — Patient visits, no-show/cancelled rates, poly performance, waiting times, busy hours, user activity
- **Role-Based Access** — 6 roles (Superadmin, Kepala Klinik, Dokter, Perawat Anamnesa, Perawat Asisten, Administrasi) with route-level permissions
- **Master Data** — CRUD for users, roles, patients, poly (clinics), schedules, statuses
- **Configuration** — WhatsApp integration, message templates, reminder configs, FAQ management, system settings
- **i18n** — Indonesian (default) and English

## Tech Stack

| Layer | Tools |
|-------|-------|
| Framework | React 19, TypeScript, Vite 7 |
| Routing | TanStack Router (file-based) |
| Server State | TanStack Query |
| Client State | Zustand |
| Forms | React Hook Form + Zod v4 |
| Styling | Tailwind CSS 4, shadcn/ui |
| HTTP | Axios |
| Realtime | Laravel Echo + Pusher.js (Laravel Reverb) |
| Charts | Recharts |
| i18n | i18next |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or npm/yarn/pnpm)
- Backend API running (Laravel)

### Installation

```bash
git clone <repo-url>
cd klinik-aulia-sehat
bun install
```

### Environment Setup

Copy the example env file and configure:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_REVERB_APP_KEY` | Laravel Reverb app key | — |
| `VITE_REVERB_HOST` | Reverb WebSocket host | `localhost` |
| `VITE_REVERB_PORT` | Reverb WebSocket port | `8080` |
| `VITE_REVERB_SCHEME` | `http` or `https` | `http` |

Realtime features (queue display) require Reverb to be configured. Without it, the app works but live updates are disabled.

### Development

```bash
bun dev          # Start dev server
bun run build    # TypeScript check + production build
bun run lint     # Run ESLint
bun run preview  # Preview production build
```

## Project Structure

```
src/
├── routes/           # File-based routes (TanStack Router)
├── services/         # API layer (Axios calls)
├── hooks/            # TanStack Query hooks + utilities
├── stores/           # Zustand stores (auth, locale)
├── types/            # TypeScript interfaces (API types)
├── components/
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # App shell (sidebar, header)
│   ├── data-table/   # Reusable CRUD table component
│   └── [domain]/     # Domain-specific components (patient, queue, etc.)
├── lib/
│   ├── i18n/         # i18next config + translation resources
│   ├── roles.ts      # Role definitions + route access control
│   ├── axios.ts      # API client with auth interceptors
│   └── utils.ts      # Utility functions
└── main.tsx          # Entry point
```

## Roles & Permissions

| Role | Access |
|------|--------|
| Superadmin | All routes |
| Kepala Klinik | Dashboard, reports, schedules, queue, master data |
| Dokter | Dashboard, doctor queue, checkup schedules |
| Perawat Anamnesa | Dashboard, nurse queue, checkup schedules |
| Perawat Asisten | Dashboard, assistant nurse queue, checkup schedules |
| Administrasi | Dashboard, admin queue, schedules |
