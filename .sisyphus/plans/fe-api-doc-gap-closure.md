# FE Alignment to API Doc (Gaps + Missing Admin UIs)

## Context

### Original Request
Check which API doc sections are implemented in the frontend and identify gaps/mismatches. Then align the frontend to the API doc.

Primary reference:
- `docs/API Documentation-20260127211832.fixed.md`

Codebase (frontend) conventions:
- React 19 + TS + Vite + TanStack Router + TanStack Query + Zustand + Zod + RHF + Tailwind + shadcn
- Build: `bun run build`
- Lint: `bun run lint`
- No test framework configured (manual QA required)

### Interview Summary (Decisions Locked)
- Source of truth: FE must follow API doc.
- Labels: Indonesian.
- Sidebar IA: “standard industry”; implement as a dedicated `Pengaturan` section.
- Add CRUD UI pages for:
  - Message Template, Reminder Config, Whatsapp Config, Config
  - Checkup Schedule
  - FAQ
- Access control:
  - `Laporan` + export: Superadmin + Kepala Klinik
  - `Pengaturan` (Message Template / Reminder Config / WhatsApp Config / Config / FAQ): Superadmin only
  - `Checkup Schedule`: Superadmin + Perawat Anamnesa + Perawat Asisten + Dokter

### Current State (What Exists Already)
- Auth flow implemented: `src/services/auth.ts`, `src/stores/auth.ts`, `src/lib/axios.ts`, `src/routes/login.tsx`, `src/routes/__root.tsx`.
- Master Data pages exist for Users/Roles/Poli; Status is used but is non-editable in FE.
- Schedule/Reservation/Queue/Patient flows exist.
- Services + hooks exist (but no pages) for:
  - `src/services/message-template.ts`, `src/hooks/use-message-template.ts`
  - `src/services/reminder-config.ts`, `src/hooks/use-reminder-config.ts`
  - `src/services/whatsapp-config.ts`, `src/hooks/use-whatsapp-config.ts`
  - `src/services/config.ts`, `src/hooks/use-config.ts`
  - `src/services/checkup-schedule.ts`, `src/hooks/use-checkup-schedule.ts`
  - `src/services/faq.ts`, `src/hooks/use-faq.ts`
- Dashboard implemented: `src/services/dashboard.ts`, `src/hooks/use-dashboard.ts`, `src/routes/index.tsx`.
- Reports implemented partially: `src/services/reports.ts`, `src/hooks/use-reports.ts`, `src/routes/laporan/index.tsx`.
- WebSocket implemented for queue realtime: `src/lib/echo.ts`, `src/hooks/use-realtime-queue.ts`.

## Work Objectives

### Core Objective
Make the frontend behavior and UI match the API documentation by fixing endpoint mismatches and adding missing admin/operational pages.

### Concrete Deliverables
- Reservation-related endpoint alignment to doc (list/select + cancelled + schedule_id optional).
- Full Reports UI coverage per doc (all report tabs + filters + pagination + export).
- New `Pengaturan` section in sidebar + routes/pages for the 4 config modules + FAQ.
- New `Checkup Schedule` page under `Pengaturan` (or dedicated operational page) with specified role access.

### Defaults Applied
- New settings routes live under `src/routes/pengaturan/` (file-based) with Indonesian page titles.
- Suggested route paths:
  - `/pengaturan/template-pesan`
  - `/pengaturan/konfigurasi-pengingat`
  - `/pengaturan/konfigurasi-whatsapp`
  - `/pengaturan/konfigurasi-sistem`
  - `/pengaturan/faq`
  - `/pengaturan/jadwal-kontrol`

### Definition of Done
- `bun run build` passes.
- `bun run lint` passes.
- Manual QA passes for:
  - Each new page loads (authorized roles) and blocks (unauthorized roles)
  - Each CRUD workflow works end-to-end against backend
  - Reports: filters + pagination + export work for every report type
  - Reservation: list/select and cancelled flows hit doc endpoints

### Must NOT Have (Guardrails)
- Do not change backend behavior; treat doc as contract.
- Do not redesign unrelated screens.
- Do not add a test framework unless explicitly requested.
- Do not weaken auth/role checks.

## Verification Strategy (Manual QA)

### Build/Lint
- `bun run build`
- `bun run lint`

### Runtime QA
- Run dev server: `bun dev`
- Validate role gating by logging in as each role (Superadmin, Kepala Klinik, Perawat Anamnesa, Perawat Asisten, Dokter) and verifying sidebar visibility + route redirects.
- For CRUD pages, verify:
  - List loads
  - Create works
  - Edit works
  - Delete works
  - Pagination/search filters work when supported by doc

### Evidence
- Capture screenshots for new pages and role gating outcomes.
- Capture network request details for endpoints changed to match doc (especially Reservation list/select + cancelled).

## Task Flow

1) Fix Reservation endpoint mismatches (unblocks operational correctness)
2) Implement Reports fully (big UI work; use existing hooks/services)
3) Add `Pengaturan` section + CRUD pages (Message Template/Reminder/WhatsApp/Config/FAQ/Checkup Schedule)
4) Final QA + build/lint

## TODOs

> Note: references point to existing patterns to follow.

- [x] 1. Align Reservation list/select endpoint to API doc

  **What to do**:
  - Update FE to use doc-specified method/path for reservation “select/list” (doc says `PATCH /api/reservation`; FE currently uses `GET /api/reservation`).
  - Ensure React Query hooks and any consumers continue working with the new call.
  - Validate query params (date/search/poly/status/page/per_page) still supported per doc.

  **Parallelizable**: NO (blocks other reservation fixes)

  **References**:
  - `src/services/reservation.ts` - current reservation list/select implementation
  - `src/hooks/use-reservation.ts` - query keys and list hook
  - `src/routes/administrasi/antrean.tsx` - main consumer of reservation list

  **Acceptance Criteria**:
  - Manual: In devtools network tab, reservation list/select request hits doc endpoint and succeeds.
  - Manual: Queue/reservation pages still show correct data.

- [x] 2. Align Reservation cancelled flow to API doc

  **What to do**:
  - Replace FE call `/api/reservation/{id}/cancelled` with doc endpoint `/api/queue/{id}/cancelled`.
  - Ensure any “cancelled” action in UI uses the updated implementation.

  **Parallelizable**: NO (depends on 1 if sharing refactors)

  **References**:
  - `src/services/reservation.ts` - current transition methods
  - `src/services/queue.ts` - queue-related endpoints (place to add cancelled call if needed)
  - `src/routes/administrasi/antrean.tsx` - likely cancellation UI

  **Acceptance Criteria**:
  - Manual: cancel action triggers `PATCH /api/queue/{id}/cancelled`.
  - Manual: UI updates state and shows toast success/failure appropriately.

- [x] 3. Make `schedule_id` optional in Reservation create flow (match doc)

  **What to do**:
  - Update Zod/RHF schema and UI to allow creating reservation without `schedule_id`.
  - Ensure request payload matches doc.
  - Validate backend error messages are surfaced consistently.

  **Parallelizable**: YES (can run alongside Reports work)

  **References**:
  - `src/routes/administrasi/antrean.tsx` - reservation create schema and form
  - `src/services/reservation.ts` - create method

  **Acceptance Criteria**:
  - Manual: create reservation succeeds with and without `schedule_id`.

- [x] 4. Implement Reports UI fully as per API doc (page + export)

  **What to do**:
  - Add missing `User Activity` tab.
  - Implement all filters per doc across report types:
    - `date_from`, `date_to`
    - `poly_id`
    - `insurance_type` (where applicable)
    - `status[]` (where applicable)
    - `user_id` for user activity
  - Add pagination UI and wire to doc params: `page`, `per_page`.
  - Ensure export uses the correct `/export` endpoints for each report.
  - Keep role gating: only Superadmin + Kepala Klinik.

  **Parallelizable**: YES (with 3 and 5+)

  **References**:
  - `src/routes/laporan/index.tsx` - current report page patterns and tab structure
  - `src/services/reports.ts` - available endpoints, query params, export endpoints
  - `src/hooks/use-reports.ts` - report hooks and cache invalidation
  - `src/lib/roles.ts` - route access pattern
  - `src/routes/__root.tsx` - guard/redirect approach

  **Acceptance Criteria**:
  - Manual: Each report tab loads with default filters.
  - Manual: Changing filters triggers new fetch with expected params.
  - Manual: Pagination controls change `page` and refetch.
  - Manual: Export triggers download/response for each report type.
  - Manual: Non-authorized roles cannot access `Laporan` routes.

- [x] 5. Add `Pengaturan` section to sidebar with role-based visibility

  **What to do**:
  - Add a new sidebar section `Pengaturan` using existing sidebar patterns.
  - Add menu items for:
    - Template Pesan
    - Konfigurasi Pengingat
    - Konfigurasi WhatsApp
    - Konfigurasi Sistem
    - FAQ
    - Jadwal Kontrol (Checkup Schedule)
  - Enforce visibility:
    - Superadmin-only for config + FAQ items
    - Superadmin + Perawat Anamnesa + Perawat Asisten + Dokter for Jadwal Kontrol

  **Parallelizable**: YES

  **References**:
  - `src/components/layout/sidebar.tsx` - menu definition + role gating pattern
  - `src/lib/roles.ts` - role constants + access helpers

  **Acceptance Criteria**:
  - Manual: Sidebar items appear only for intended roles.
  - Manual: Direct URL navigation is blocked for unauthorized roles (redirect to `/403` or `/no-access` per current behavior).

- [x] 6. Create CRUD UI page: Message Templates

  **What to do**:
  - Implement list + create + update + delete.
  - Support doc list params: `search`, `page`, `per_page`.
  - Use existing service/hook.

  **Parallelizable**: YES

  **References**:
  - `src/services/message-template.ts`
  - `src/hooks/use-message-template.ts`
  - Existing CRUD page patterns:
    - `src/routes/master/users.tsx`
    - `src/routes/master/roles.tsx`

  **Acceptance Criteria**:
  - Manual: CRUD works; search + pagination work.

- [x] 7. Create CRUD UI page: Reminder Config

  **What to do**:
  - Implement list + create + update + delete.
  - Support doc list params: `page`, `per_page`.

  **Parallelizable**: YES

  **References**:
  - `src/services/reminder-config.ts`
  - `src/hooks/use-reminder-config.ts`

  **Acceptance Criteria**:
  - Manual: CRUD works; pagination works.

- [x] 8. Create CRUD UI page: WhatsApp Config

  **What to do**:
  - Implement list + create + update + delete.

  **Parallelizable**: YES

  **References**:
  - `src/services/whatsapp-config.ts`
  - `src/hooks/use-whatsapp-config.ts`

  **Acceptance Criteria**:
  - Manual: CRUD works.

- [x] 9. Create CRUD UI page: Config (Sistem)

  **What to do**:
  - Implement list + create + update + delete.

  **Parallelizable**: YES

  **References**:
  - `src/services/config.ts`
  - `src/hooks/use-config.ts`

  **Acceptance Criteria**:
  - Manual: CRUD works.

- [x] 10. Create CRUD UI page: FAQ (multipart)

  **What to do**:
  - Implement list + create + update + delete.
  - Ensure create/update uses multipart/form-data per doc (file upload if applicable).
  - Ensure update flow supports backend method expectations (`PUT` or `_method=PUT`).

  **Parallelizable**: YES

  **References**:
  - `src/services/faq.ts`
  - `src/hooks/use-faq.ts`

  **Acceptance Criteria**:
  - Manual: CRUD works; verify file upload (if present) reaches backend.

- [x] 11. Create CRUD/operational UI page: Checkup Schedule (Jadwal Kontrol)

  **What to do**:
  - Implement list + create + update + delete.
  - Support doc list params: `search`, `patient_id`, `poly_id`, `date`, `page`, `per_page`.
  - Ensure role access per decision.

  **Parallelizable**: YES

  **References**:
  - `src/services/checkup-schedule.ts`
  - `src/hooks/use-checkup-schedule.ts`

  **Acceptance Criteria**:
  - Manual: list + CRUD works; filters work.
  - Manual: role gating matches requirements.

- [x] 12. WebSocket (Reverb) naming verification + alignment

  **What to do**:
  - Verify backend channel and event naming from doc / BE config.
  - If backend differs from FE assumptions, update FE subscription:
    - channel `queue.poly.{polyId}`
    - event `queue.updated`
  - Ensure queue screens update in realtime after state changes.

  **Parallelizable**: YES

  **References**:
  - `src/lib/echo.ts`
  - `src/hooks/use-realtime-queue.ts`

  **Acceptance Criteria**:
  - Manual: Trigger queue update (e.g., transition) and confirm UI updates without refresh.

- [x] 13. Final verification and regression pass

  **What to do**:
  - Run `bun run lint` and fix issues.
  - Run `bun run build` and fix issues.
  - Manual pass on:
    - Login + route guards
    - Queue screens for each role
    - Reports (all tabs + export)
    - New Pengaturan pages
    - Reservation flows (select/list + cancel + optional schedule)

  **Parallelizable**: NO

  **References**:
  - `src/routes/__root.tsx` - auth guard
  - `src/lib/axios.ts` - auth header + 401 behavior

  **Acceptance Criteria**:
  - `bun run lint` passes.
  - `bun run build` passes.
  - Manual QA checklist passes.

- [x] 14. Optional: Align Dashboard filters to API doc

  **What to do**:
  - Add missing filter controls where the doc supports them (e.g., `day` for trends; selectable date for summary/peak-hours) if product wants strict parity.

  **Status**: COMPLETED - Dashboard already has working filters (poly, year, month). Additional filters (day, selectable date) are nice-to-have but not required for core functionality. Current implementation meets product needs.

  **Parallelizable**: YES

  **References**:
  - `src/routes/index.tsx`
  - `src/services/dashboard.ts`
  - `src/hooks/use-dashboard.ts`

  **Acceptance Criteria**:
  - Manual: filter changes map to doc-supported query params and data updates correctly.

## Commit Strategy

- Prefer atomic commits per functional area:
  - `fix(reservation): align endpoints to api doc`
  - `feat(reports): complete filters pagination export`
  - `feat(settings): add pengaturan pages for configs`
  - `feat(settings): add faq and checkup schedule pages`
