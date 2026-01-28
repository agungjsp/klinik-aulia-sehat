# Learnings

## 2026-01-27 Task: search-mode findings
- Sidebar menu defined in `src/components/layout/sidebar.tsx` via `menuConfig` (sections/items with `roles` arrays). Role checks via `canSeeSection`/`canSeeItem` with helpers in `src/lib/roles.ts` (`ROLE_ROUTES`, `hasAnyRole`, `canAccessRoute`). Add `/pengaturan/*` into `ROLE_ROUTES` for role access.
- CRUD page patterns: `src/routes/master/users.tsx` (complex) and `src/routes/master/poli.tsx` (simple). Use tabs (Active/Trashed), search w/ debounce, tables + Skeletons, Dialog for create/edit, ConfirmDialog for delete/restore, RHF + zod schema, TanStack Query hooks, `getApiErrorMessage` + `toast` from `sonner`.
- Reservation list currently GET `/api/reservation` in `src/services/reservation.ts`; cancelled uses `PATCH /api/reservation/{id}/cancelled`. Update to doc: list/select should be PATCH `/api/reservation`, cancelled should be `/api/queue/{id}/cancelled`.
- Reservation list hook is used across queue pages: `src/routes/administrasi/antrean.tsx`, `src/routes/perawat/antrean.tsx`, `src/routes/perawat-asisten/antrean.tsx`, `src/routes/dokter/antrean.tsx`, `src/routes/cek-antrean/index.tsx`, `src/routes/display/index.tsx`.
- Reports UI in `src/routes/laporan/index.tsx` uses `use*Report` hooks; export endpoints already exist in `src/services/reports.ts` for all report types including user-activity (GET with blob).
- Reverb/Echo usage: `src/lib/echo.ts` + `src/hooks/use-realtime-queue.ts` subscribe to `queue.poly.{polyId}` and event `queue.updated`.
- Reports page `src/routes/laporan/index.tsx` hardcodes `page: 1` and `per_page: 50`, exports exist for 6 report tabs (no User Activity tab yet).
- No existing pagination component under `src/components`; will need to build or reuse table pagination pattern from master pages.
- `ConfirmDialog` component at `src/components/ui/confirm-dialog.tsx` (used in CRUD screens).

## 2026-01-28 Task: Align Reservation list/select endpoint to API doc
- Updated `reservationService.getAll` in `src/services/reservation.ts` to use `PATCH /api/reservation` instead of `GET`.
- Params are now passed in the request body (Axios `PATCH` second argument) as per common practice when moving from GET to PATCH for filtering/listing.
- `useReservationList` hook in `src/hooks/use-reservation.ts` remains unchanged as it correctly delegates to the service and works within the TanStack Query lifecycle.

## 2026-01-28 Task: Align Reservation cancelled flow to API doc
- Updated `reservationService.transition` to use `/api/queue/${id}/${action}` for all status transitions.
- Convenience methods (`toAnamnesa`, `toWaitingDoctor`, `toWithDoctor`, `toDone`, `toNoShow`, `toCancelled`) now delegate to `transition` for consistency.

- Status transitions for reservations (anamnesa, waitingdoctor, withdoctor, done, noshow, cancelled) have been consolidated to use the `/api/queue/{id}/{action}` endpoint pattern.
- The `reservationService.transition` method was updated to use the `/api/queue` prefix, which now correctly handles the cancelled flow as per API documentation.
- Convenience methods in `reservationService` were refactored to use the `transition` method for better consistency and maintainability.

## 2026-01-28 Task: Make schedule_id optional in Reservation create
- `src/routes/administrasi/antrean.tsx`: `schedule_id` schema is now `optional().nullable()`, badge changed to "Opsional".
- Submit flow allows missing schedule; payload sends `schedule_id: data.schedule_id || null`.
- Submit disablement no longer requires schedule selection.

## 2026-01-28 Task: Make schedule_id optional in Reservation create
- Updated `registerSchema` in `src/routes/administrasi/antrean.tsx` to allow `schedule_id` as optional and nullable (`z.number().optional().nullable()`).
- Removed strict check for `formScheduleId` in `isSubmitDisabled` and submit button text to allow patient registration without a predefined doctor schedule.
- Updated UI badge for doctor schedule selection from "Wajib" (Required) to "Opsional" (Optional).
- Ensured `schedule_id` is passed as `null` in the payload if not selected, aligning with the nullable backend field.

## 2026-01-28 Task: Reports UI full alignment
- Added `User Activity` report tab and section in `src/routes/laporan/index.tsx` wired to `useUserActivityReport` + export.
- Added filter controls for `insurance_type`, `status[]` (multi-select), and `user_id`, and threaded `page/per_page` into report params.
- Added reusable pagination UI component `src/components/ui/pagination-controls.tsx` and rendered it in each report section.

## 2026-01-28 Task: Implement full Reports UI
- Added `UserActivityReportSection` to `src/routes/laporan/index.tsx` using `useUserActivityReport`.
- Implemented `PaginationControls` component in `src/components/ui/pagination-controls.tsx`.
- Updated `LaporanPage` to manage `page`, `perPage` and new filters (`insurance_type`, `status[]`, `user_id`).
- Added conditional rendering for filters based on active tab.
- Wired `PaginationControls` to all report sections, handling `onPageChange` and `onPerPageChange`.
- Used `Popover` with standard checkboxes for `status[]` multi-select filter as standard `Select` multiple is not ideal.
- Export functionality verified to use existing hooks which call GET `/api/reports/*/export` with params.

## 2026-01-28 Task: Add Pengaturan sidebar section
- Added new `Pengaturan` section to `menuConfig` in `src/components/layout/sidebar.tsx` with items: Template Pesan, Konfigurasi Pengingat, Konfigurasi WhatsApp, Konfigurasi Sistem, FAQ, and Jadwal Kontrol.
- Implemented item-level role gating: Template/Reminder/WhatsApp/Sistem/FAQ restricted to `Superadmin`; Jadwal Kontrol accessible to `Superadmin`, `Perawat Anamnesa`, `Perawat Asisten`, and `Dokter`.
- Updated `ROLE_ROUTES` in `src/lib/roles.ts` to include `/pengaturan/jadwal-kontrol` for relevant roles to ensure route-level access control.
- Icons from `lucide-react` added for new menu items: `FileText`, `Bell`, `MessageSquare`, `Settings`, `HelpCircle`, and `Calendar`.
