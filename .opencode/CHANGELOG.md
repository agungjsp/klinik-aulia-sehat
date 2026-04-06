# Changelog

## 2026-04-05

### Table normalization and reuse foundation
- Added reusable table layer:
  - `src/components/data-table/data-table.tsx`
  - `src/components/data-table/data-table-pagination.tsx`
  - `src/components/data-table/data-table-toolbar.tsx`
  - `src/components/data-table/index.ts`
- Added shared table typing and pagination normalization:
  - `src/types/table.ts`
  - `src/services/adapters/pagination.ts`
  - `src/services/types/query.ts`
  - updated `src/types/index.ts` export
- Normalized list hooks to return a common table shape (`items` + `meta`):
  - `src/hooks/use-patient.ts`
  - `src/hooks/use-message-template.ts`
  - `src/hooks/use-reminder-config.ts`
  - `src/hooks/use-checkup-schedule.ts`
- Updated patient API contract to be server-sort-ready (`sort_by`, `sort_order`) and table-friendly:
  - `src/services/patient.ts`
  - `src/components/patient/patient-autocomplete.tsx`
- Migrated operational table pages to shared DataTable patterns and standardized action cells:
  - `src/routes/master/pasien.tsx`
  - `src/routes/master/users.tsx`
  - `src/routes/master/roles.tsx`
  - `src/routes/master/poli.tsx`
  - `src/routes/pengaturan/konfigurasi-sistem.tsx`
  - `src/routes/pengaturan/konfigurasi-whatsapp.tsx`
  - `src/routes/pengaturan/faq.tsx`
  - `src/routes/pengaturan/konfigurasi-pengingat.tsx`
  - `src/routes/pengaturan/jadwal-kontrol.tsx`
  - `src/routes/pengaturan/template-pesan.tsx`
- Partially normalized laporan table sections in `src/routes/laporan/index.tsx` to use shared DataTable + DataTablePagination.
- Added persistent design context file:
  - `.impeccable.md`

### Verification
- Build/type-check passed: `bun run build`.
- Lint has existing pre-existing unrelated failures in:
  - `src/components/doctor/doctor-select.tsx`
  - `src/routes/display/index.tsx`

### Lint baseline cleanup
- Fixed `react-refresh/only-export-components` by moving `useDoctorData` out of `src/components/doctor/doctor-select.tsx` into a dedicated hook file:
  - `src/hooks/use-doctor-data.ts`
  - updated `src/hooks/index.ts` export
  - updated `src/components/doctor/index.ts` export
  - updated `src/routes/jadwal/index.tsx` import to use hook from `@/hooks`
- Fixed `react-hooks/exhaustive-deps` and `react-hooks/preserve-manual-memoization` in `src/routes/display/index.tsx` by:
  - stabilizing `statuses` with `useMemo`
  - deriving a memoized `statusIdMap`
  - making `getStatusId` stable with `useCallback`
  - updating memo dependencies for total stats to use stable inputs

### Verification update
- Lint now passes: `bun run lint`.
- Build/type-check still passes: `bun run build`.

### Runtime export fix for `useDoctorData`
- Fixed hooks barrel self-import cycle that caused runtime ESM export error (`does not provide an export named 'useDoctorData'`):
  - `src/hooks/use-doctor-data.ts`
    - changed import from `@/hooks` to direct module import `./use-user`
- Added lint guardrail to prevent recurrence in hook modules:
  - `eslint.config.js`
    - added `no-restricted-imports` for `src/hooks/**/*` to forbid `@/hooks` and `@/hooks/index` imports from within hooks

### Verification update 2
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Display poly cards visual revamp (clinical signage)
- Refactored `PolySection` visual composition in `src/routes/display/index.tsx` to reduce AI-slop and increase purposeful hierarchy while keeping existing queue logic intact.
- Updated hero card (`Sedang Dilayani`):
  - shifted to cleaner two-column signage layout
  - removed decorative ping animation
  - emphasized queue number with structured divider and stronger typographic hierarchy
- Updated anamnesa block:
  - renamed presentation to clear `Sedang Anamnesa`
  - replaced glow/pulse-heavy style with restrained status strip
  - retained same data bindings and fallback states
- Updated waiting queue board:
  - replaced ring/gradient-heavy cards with cleaner tile system
  - retained first-item `Selanjutnya` emphasis using subtle marker
  - preserved ordering, cap (`8`), and overflow indicator behavior
- Added shared local class primitives in component (`cardShell`, `labelClass`) for tighter style consistency.

### Verification update 3
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Display readability pass (TV distance)
- Tuned `src/routes/display/index.tsx` poly cards for better readability on large display distances (1080p/4K):
  - increased label/body size rhythm and spacing contrast in hero/anamnesa/waiting sections
  - switched critical numbers/headlines to responsive `clamp(...)` scales for stable viewing across resolutions
  - increased contrast on borders/backgrounds and queue count badge
  - enlarged waiting tiles and text for faster scanability at distance
  - retained subtle-only motion and existing behavior semantics

### Verification update 4
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Display ultra-wide balance pass (50% zoom)
- Tuned `/display` main content framing to reduce left-right dead space and keep focal flow centered on ultra-wide screens:
  - `src/routes/display/index.tsx`
    - updated main container to responsive horizontal padding by breakpoint
    - introduced centered max-width canvas for the two-poly grid
    - adjusted inter-panel gaps for xl/2xl/3xl
    - constrained each poly card column width with centered alignment (`max-w-[1160px]`) to avoid over-stretch

### Verification update 5
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Confirmation dialog normalization rollout (data-changing actions)
- Added missing confirmation gate for queue actions in `src/routes/perawat-asisten/antrean.tsx`:
  - `Panggil`, `Panggil Ulang`, and `No Show` now require contextual confirmation first.
  - Added action-specific dialog content (`entityName`, `impactItems`, `recoveryHint`, destructive variant for no-show).
- Added confirmation-before-submit on critical form updates:
  - `src/routes/pengaturan/konfigurasi-sistem.tsx`
  - `src/routes/pengaturan/konfigurasi-whatsapp.tsx`
  - `src/routes/pengaturan/konfigurasi-pengingat.tsx`
  - `src/routes/pengaturan/template-pesan.tsx`
  - `src/routes/master/pasien.tsx`
  - Each now captures form payload first, then applies mutation only after confirmation dialog.
- Improved destructive delete dialog content quality in settings/template routes:
  - added `entityName`, `impactItems`, `recoveryHint`, `variant="destructive"`, and explicit confirm labels.
- Added confirmation for follow-up decision flow in `src/routes/dokter/antrean.tsx`:
  - `Tidak Perlu`, `Ya, Jadwalkan`, and final save now pass through use-case-specific confirmation.
- Kept non-mutating actions (search/filter/pagination/navigation/export) unchanged to avoid unnecessary friction.

### Verification update 6
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Localization foundation and rollout (ID/EN)
- Added i18n stack and bootstrap:
  - `package.json` (new deps: `i18next`, `react-i18next`, `i18next-browser-languagedetector`)
  - `src/lib/i18n/config.ts`
  - `src/lib/i18n/index.ts`
  - `src/lib/i18n/resources/index.ts`
  - namespace resources:
    - `src/lib/i18n/resources/id/common.ts`
    - `src/lib/i18n/resources/id/auth.ts`
    - `src/lib/i18n/resources/id/nav.ts`
    - `src/lib/i18n/resources/id/errors.ts`
    - `src/lib/i18n/resources/id/queue.ts`
    - `src/lib/i18n/resources/id/language.ts`
    - `src/lib/i18n/resources/en/common.ts`
    - `src/lib/i18n/resources/en/auth.ts`
    - `src/lib/i18n/resources/en/nav.ts`
    - `src/lib/i18n/resources/en/errors.ts`
    - `src/lib/i18n/resources/en/queue.ts`
    - `src/lib/i18n/resources/en/language.ts`
- Added persisted locale state and hook:
  - `src/stores/locale.ts`
  - `src/stores/index.ts` export update
  - `src/hooks/use-locale.ts`
  - `src/hooks/index.ts` export update
- Wired app-level language synchronization:
  - `src/main.tsx` (i18n bootstrap import)
  - `src/routes/__root.tsx` (store -> i18n sync + `document.documentElement.lang`)
  - `src/components/layout/app-layout.tsx` (language switcher)
- Localized shared UI shell and controls:
  - `src/components/layout/sidebar.tsx`
  - `src/components/ui/pagination-controls.tsx`
  - `src/components/data-table/data-table.tsx`
  - `src/components/ui/confirm-dialog.tsx`
  - `src/components/poly/poly-select.tsx`
  - `src/components/doctor/doctor-select.tsx`
  - `src/components/user/user-select.tsx`
  - `src/components/role/role-checkbox-group.tsx`
  - `src/components/patient/patient-autocomplete.tsx`
- Added localized queue status keying and usage:
  - `src/lib/queue-status.ts` (`translationKey` per status)
  - `src/components/antrean/antrean-header.tsx`
  - `src/routes/administrasi/antrean.tsx`
  - `src/routes/cek-antrean/index.tsx`
- Added locale-aware date helpers and migrated hardcoded date locale usage:
  - `src/lib/i18n/date-locale.ts`
  - `src/lib/i18n/formatters.ts`
  - `src/components/ui/calendar.tsx`
  - `src/routes/index.tsx`
  - `src/routes/display/index.tsx`
  - `src/routes/cek-antrean/index.tsx`
  - `src/components/antrean/antrean-header.tsx`
  - `src/routes/jadwal/index.tsx`
  - `src/routes/laporan/index.tsx`
  - `src/routes/master/poli.tsx`
  - `src/routes/master/roles.tsx`
- Localized base error routes:
  - `src/routes/$.tsx`
  - `src/routes/403.tsx`
  - `src/routes/no-access.tsx`
- Partial route-level text localization pass applied to:
  - `src/routes/login.tsx`
  - `src/routes/master/pasien.tsx`
  - `src/routes/master/users.tsx`
  - `src/routes/pengaturan/konfigurasi-sistem.tsx`
  - `src/routes/pengaturan/faq.tsx`
- Added localization documentation:
  - `docs/localization.md`

### Verification update 6
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Localization continuation (administrasi antrean)
- Added new localization namespace for admin queue workflow:
  - `src/lib/i18n/resources/id/admin-queue.ts`
  - `src/lib/i18n/resources/en/admin-queue.ts`
  - wired in `src/lib/i18n/resources/index.ts`
  - registered namespace in `src/lib/i18n/index.ts`
- Migrated major hardcoded strings in `src/routes/administrasi/antrean.tsx` to i18n keys:
  - page/header titles, list/filter labels, queue empty states
  - registration dialog step labels and form labels/placeholders/buttons
  - no-show confirm dialog copy and impact messages
  - success/error toast messages for queue actions and registration
  - BPJS/General type labels now use existing `queue:patientTypes.*`
- Replaced static validation schema messages with translation-backed messages inside form initialization to support language switching.

### Verification update 7
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Localization continuation (laporan route)
- Added dedicated reports namespace resources:
  - `src/lib/i18n/resources/id/reports.ts`
  - `src/lib/i18n/resources/en/reports.ts`
  - wired in `src/lib/i18n/resources/index.ts`
  - registered namespace in `src/lib/i18n/index.ts`
- Migrated major hardcoded strings in `src/routes/laporan/index.tsx` to `reports` i18n keys:
  - page title and filter labels/options
  - tab labels for all report sections
  - section table headers, KPI labels/subtitles, card titles/descriptions
  - empty states and export button label
  - export success/failure toast messages
  - waiting-time formatting and count labels now translation-backed

### Verification update 8
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Localization continuation (master/settings accessibility labels)
- Localized remaining hardcoded action `aria-label` strings in table action buttons:
  - `src/routes/master/users.tsx`
  - `src/routes/master/roles.tsx`
  - `src/routes/master/poli.tsx`
  - `src/routes/pengaturan/konfigurasi-pengingat.tsx`
  - `src/routes/pengaturan/jadwal-kontrol.tsx`
- Added new translation keys for those labels in ID/EN resources:
  - `src/lib/i18n/resources/id/master.ts`
  - `src/lib/i18n/resources/en/master.ts`
  - `src/lib/i18n/resources/id/reminder-config.ts`
  - `src/lib/i18n/resources/en/reminder-config.ts`
  - `src/lib/i18n/resources/id/checkup-schedule.ts`
  - `src/lib/i18n/resources/en/checkup-schedule.ts`

### Verification update 9
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Localization continuation (manual sweep without mgrep quota)
- Completed manual route-by-route localization sweep for remaining hardcoded strings in major workflow pages.
- Added new i18n namespaces and resources:
  - `src/lib/i18n/resources/id/settings.ts`
  - `src/lib/i18n/resources/en/settings.ts`
  - `src/lib/i18n/resources/id/patient.ts`
  - `src/lib/i18n/resources/en/patient.ts`
  - `src/lib/i18n/resources/id/nurse-queue.ts`
  - `src/lib/i18n/resources/en/nurse-queue.ts`
- Wired new namespaces in i18n registry:
  - `src/lib/i18n/resources/index.ts`
  - `src/lib/i18n/index.ts`
- Expanded existing namespaces for remaining copy:
  - `src/lib/i18n/resources/id/admin-queue.ts`
  - `src/lib/i18n/resources/en/admin-queue.ts`
  - `src/lib/i18n/resources/id/queue.ts`
  - `src/lib/i18n/resources/en/queue.ts`
  - `src/lib/i18n/resources/id/errors.ts`
  - `src/lib/i18n/resources/en/errors.ts`
- Localized and migrated hardcoded strings in routes:
  - `src/routes/pengaturan/konfigurasi-sistem.tsx`
  - `src/routes/pengaturan/konfigurasi-whatsapp.tsx`
  - `src/routes/pengaturan/template-pesan.tsx`
  - `src/routes/pengaturan/faq.tsx`
  - `src/routes/master/pasien.tsx`
  - `src/routes/perawat/antrean.tsx`
  - `src/routes/perawat-asisten/antrean.tsx`
  - `src/routes/administrasi/antrean.tsx` (removed fallback/default i18n literals in register confirm)
- Minor robustness normalization:
  - `src/routes/laporan/index.tsx` now treats `Done` status value equivalently with `DONE`/`Selesai` when computing completed state.

### Verification update 10
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

### Localization continuation (final string cleanup pass)
- Removed last hardcoded status label usage in queue list rendering:
  - `src/routes/administrasi/antrean.tsx`
  - status dropdown and badges now consistently use `queue` translation keys from `QUEUE_STATUS_CONFIG.translationKey`.
- Removed hardcoded brand/system text in display header:
  - `src/routes/display/index.tsx`
  - now sourced from `common:appName` and `common:systemName`.

### Verification update 11
- Lint passes: `bun run lint`.
- Build/type-check passes: `bun run build`.

## 2026-04-06 - Quota unlimited semantics (null or 0)

- Added shared quota utility at `src/lib/quota.ts` with centralized `isUnlimitedQuota` and `getQuotaUsage` helpers.
- Updated admin queue summary logic to treat `quota = 0` as unlimited in `src/hooks/use-antrean-summary.ts` and `src/routes/administrasi/antrean.tsx`.
- Updated schedule selection and selected schedule summary behavior in `src/components/schedule/schedule-picker.tsx` so `quota = 0` is not marked full and shows unlimited state.
- Updated schedule management validations and rendering in `src/routes/jadwal/index.tsx`:
  - Poli Gigi now allows `quota = 0`.
  - quota input `min` changed from `1` to `0`.
  - finite quota display checks now use explicit `quota > 0` semantics.
- Verification run: `bun run lint` and `bun run build` both passed.
