# Senior-Friendly Table UI Refresh

## TL;DR

Improve readability + aesthetics of all shadcn-style tables by upgrading the shared Table primitive (`src/components/ui/table.tsx`), aligning skeleton/loading states, and migrating the highest-traffic table pages to opt into the new “senior-friendly” defaults (spacing, contrast, zebra rows, sticky header, better truncation/wrapping, clearer actions).

**Primary deliverables**
- Updated Table primitive with senior-friendly variants (size/density, sticky header, zebra, row hover, better truncation/wrapping defaults)
- Updated table skeleton/loading UI to match
- Updated route tables to use the new variants consistently (starting with high-impact pages)
- Automated verification via Playwright walkthrough + screenshots (or add Playwright as part of this work)

**Estimated effort**: Medium (UI-only but touches multiple routes)

---

## Context (What Exists Today)

**Table primitive**
- `src/components/ui/table.tsx` is the single canonical table primitive used across the app.
- It currently hardcodes relatively “dense” defaults for many older users:
  - Cells: `p-4` + `whitespace-nowrap` (forces horizontal scroll and makes long text harder to read)
  - Header: `h-10` + `whitespace-nowrap`
  - Visual separation relies mostly on light borders + subtle header background.

**Skeleton/loading**
- `src/components/ui/table-skeleton.tsx` implements table skeleton patterns.

**Where tables are used** (non-exhaustive, high-confidence list)
- `src/routes/master/users.tsx`
- `src/routes/master/pasien.tsx`
- `src/routes/master/roles.tsx`
- `src/routes/master/poli.tsx`
- `src/routes/pengaturan/template-pesan.tsx`
- `src/routes/pengaturan/konfigurasi-pengingat.tsx`
- `src/routes/pengaturan/jadwal-kontrol.tsx`
- `src/routes/pengaturan/konfigurasi-sistem.tsx`
- `src/routes/pengaturan/konfigurasi-whatsapp.tsx`
- `src/routes/pengaturan/faq.tsx`
- `src/routes/laporan/index.tsx` (largest/most complex: multiple report tables)

---

## Goals

1) **Senior-friendly readability**
- Larger effective text (esp. body and key columns) and more generous row height
- Stronger hierarchy (header vs body), clearer row separation
- Avoid “all text in one line” layouts; allow controlled wrapping or truncation
- Larger, clearer action affordances (icons with labels where appropriate)

2) **Still looks good**
- Clean “clinical” aesthetic: calm, high-clarity, not overly decorative
- Subtle zebra striping, refined borders, consistent alignment

3) **Consistency across pages**
- Same row density, hover, header style, and empty/loading states across routes

4) **Accessibility**
- High contrast (do not rely on color-only differences)
- Visible focus states and keyboard navigability for interactive elements

---

## Non-goals / Guardrails

- Do not rewrite data fetching, pagination logic, or route architecture.
- Do not introduce a full-featured headless table system (TanStack Table) unless explicitly requested.
- Do not add complex interaction patterns (column resizing, drag reorder) unless requested.
- Avoid “UI churn” across the entire app in one shot; migrate in prioritized waves.

---

## Senior-Friendly Table Spec (Design/UX Requirements)

These are concrete, implementable requirements to guide the executor.

**Typography**
- Body cell text target: ~15–16px (avoid <14px for primary data)
- Header text: slightly stronger weight + high contrast
- Mono IDs: keep monospace but ensure size is not too small

**Row density & spacing**
- Default row height target: ~44–52px effective (via padding + line-height)
- Reports (`src/routes/laporan/index.tsx`) may use a slightly denser variant than CRUD/config tables to reduce scrolling, while keeping contrast + separation improvements.
- Avoid tight `h-10` header if it looks cramped
- Increase hit targets for action buttons (min 36–40px)

**Contrast & separation**
- Header background: clearly distinct from body (not only 5–10% tint)
- Body rows: subtle zebra (`odd`/`even`)
- Borders: slightly stronger than current (`border-border/60` style rather than ultra-faint)

**Content overflow**
- Default: allow wrapping for long text columns (messages/descriptions) OR truncate with an obvious affordance (tooltip / title attribute) depending on column.
- Numeric columns right-aligned.
- Avoid forcing the entire table into horizontal scroll due to `whitespace-nowrap` everywhere.

**Sticky header (optional but recommended)**
- For long lists and reports: sticky table header within scroll container.

**Actions column**
- Maintain a consistent “Aksi” column width.
- Prefer a small labeled action group (Edit / Hapus / Restore) for senior-friendly clarity, especially where icons are ambiguous.

---

## Technical Approach

### A) Upgrade the Table primitive (foundation)

Primary target: `src/components/ui/table.tsx`

Add opt-in variants via props (or exported variant helpers) so routes can adopt improvements gradually:
- `size`: `"default" | "comfortable"` (comfortable = senior-friendly)
- `stickyHeader`: boolean
- `striped`: boolean
- `wrap`: `"nowrap" | "wrap" | "truncate"` defaulting to a more senior-friendly behavior

Key changes to consider (executor decides exact Tailwind classes):
- Reduce global `whitespace-nowrap` in cells/heads; move nowrap behavior to per-column usage.
- Adjust paddings/line-height for comfortable mode.
- Add stronger header styling and zebra striping.
- Ensure scroll container still works (currently `overflow-x-auto` is handled by the Table wrapper).

### B) Align skeleton/loading and empty states

Target: `src/components/ui/table-skeleton.tsx` and per-route skeleton rows.

Goals:
- Skeleton row height and spacing match the new table density.
- Empty states remain readable (centered text, enough padding) with consistent style.

### C) Migrate priority pages first

Recommended migration order (highest impact + representative patterns):
1. `src/routes/master/users.tsx`
2. `src/routes/master/pasien.tsx`
3. `src/routes/pengaturan/template-pesan.tsx`
4. `src/routes/pengaturan/konfigurasi-pengingat.tsx`
5. `src/routes/pengaturan/jadwal-kontrol.tsx`
6. `src/routes/laporan/index.tsx` (progressively, section-by-section)

Then follow with smaller config/master tables.

**Density decision (confirmed)**
- CRUD/config tables: use `comfortable`.
- Reports: keep a slightly denser variant (either `default` or a dedicated `report`/`compact` variant), but still apply the readability upgrades (header clarity, zebra, borders, overflow behavior).

---

## Verification Strategy

You confirmed verification will be **manual**.

Use this repeatable manual QA checklist for every table page:

**Run**
- `bun dev`

**For each table page (desktop + ~375px mobile width)**
- Header is clearly distinct (background + weight), and text is readable.
- Row height feels comfortable (not cramped); zebra striping is visible but subtle.
- Long text columns wrap or truncate intentionally (no accidental horizontal scroll from `nowrap`).
- Numeric columns align right; IDs remain readable.
- Action buttons are easy to tap/click and clearly labeled/understandable.
- Empty state is readable and centered; loading skeleton aligns with final layout.

If you want a lightweight evidence trail without adding test deps: capture before/after screenshots manually for the top 3 pages (Users, Pasien, Laporan).

---

## Execution Waves (Parallel-Friendly)

Wave 1 (Discovery + spec lock)
- Inventory table pages and decide which pages are in-scope for this iteration.
- Capture baseline screenshots (current UI) for comparison.

Wave 2 (Foundation)
- Update `src/components/ui/table.tsx` with senior-friendly variants.
- Update `src/components/ui/table-skeleton.tsx` accordingly.

Wave 3 (Migrate priority pages)
- Migrate 1–2 priority routes first (Users, Pasien) and validate patterns.
- Roll out to additional routes (templates/pengingat/jadwal).

Wave 4 (Reports)
- Migrate `src/routes/laporan/index.tsx` tables section-by-section.

Wave 5 (Polish + accessibility)
- Ensure action buttons have labels/aria-labels.
- Confirm focus states and contrast.
- Confirm wrapping/truncation is consistent.

---

## TODOs (Detailed)

### 1) Baseline visual audit + page prioritization

**What to do**
- Identify which table page(s) the user cares about most (top 1–3).
- Capture baseline screenshots for those pages.

**References**
- `src/routes/master/users.tsx`
- `src/routes/master/pasien.tsx`
- `src/routes/laporan/index.tsx`

**Acceptance criteria (agent-executable)**
- App runs locally (`bun dev`).
- Playwright walkthrough produces baseline screenshots for 3 pages.

### 2) Update the Table primitive to support senior-friendly variants

**What to do**
- Extend `src/components/ui/table.tsx` so routes can opt into:
  - Comfortable spacing
  - Zebra striping
  - Sticky header (where useful)
  - Better default wrapping/truncation controls
- Preserve backwards compatibility: existing tables should not break.

**References**
- `src/components/ui/table.tsx`

**Acceptance criteria (agent-executable)**
- TypeScript build passes (`bun run build`).
- Visual check on at least one route shows improved readability without layout breakage.

### 3) Align skeleton/loading table UI

**What to do**
- Update `src/components/ui/table-skeleton.tsx` so skeleton rows match the new density and column spacing.

**References**
- `src/components/ui/table-skeleton.tsx`

**Acceptance criteria (agent-executable)**
- Loading state on at least one paged route shows consistent heights and alignment.

### 4) Migrate Users table to the new variants

**What to do**
- Update `src/routes/master/users.tsx` to use comfortable mode.
- Ensure the action column is clear and has sufficient hit targets.
- Ensure email/username columns behave well on small screens (truncate/wrap).

**References**
- `src/routes/master/users.tsx`

**Acceptance criteria (agent-executable)**
- Playwright screenshot shows readable rows, clear header, and action buttons.

### 5) Migrate Patients table to the new variants

**What to do**
- Update `src/routes/master/pasien.tsx` similarly.
- Ensure long values (email, whatsapp) don’t force horizontal scroll unnecessarily.

**References**
- `src/routes/master/pasien.tsx`

**Acceptance criteria (agent-executable)**
- Playwright screenshot shows readable rows and no clipped critical data.

### 6) Migrate the key Settings tables (templates/pengingat/jadwal)

**What to do**
- Update these routes to use the new table variants and consistent empty/loading.
- Ensure long message/template columns display sensibly (wrap or truncate with tooltip).

**References**
- `src/routes/pengaturan/template-pesan.tsx`
- `src/routes/pengaturan/konfigurasi-pengingat.tsx`
- `src/routes/pengaturan/jadwal-kontrol.tsx`

**Acceptance criteria (agent-executable)**
- Playwright screenshots for each route are captured.

### 7) Migrate Reports tables progressively

**What to do**
- Apply the new table variants to each report table in `src/routes/laporan/index.tsx`.
- Ensure numeric columns remain right-aligned, and dense data remains scannable.

**References**
- `src/routes/laporan/index.tsx`

**Acceptance criteria (agent-executable)**
- Playwright screenshots for at least 2 report sections show improved readability.

### 8) Accessibility + polish pass

**What to do**
- Ensure icon-only buttons have `aria-label` and are focus-visible.
- Confirm contrast for header text, muted text, zebra stripes.
- Confirm keyboard tab order remains sane.

**Acceptance criteria (agent-executable)**
- Playwright walkthrough can tab to action buttons and shows a visible focus ring.

---

## Decisions (Confirmed)

- **Scope**: All tables using the shared Table primitive are in-scope for this iteration.
- **Verification**: Manual verification (no automated Playwright requirement).

In-scope table routes (current known list):
- `src/routes/master/users.tsx`
- `src/routes/master/pasien.tsx`
- `src/routes/master/roles.tsx`
- `src/routes/master/poli.tsx`
- `src/routes/pengaturan/template-pesan.tsx`
- `src/routes/pengaturan/konfigurasi-pengingat.tsx`
- `src/routes/pengaturan/jadwal-kontrol.tsx`
- `src/routes/pengaturan/konfigurasi-sistem.tsx`
- `src/routes/pengaturan/konfigurasi-whatsapp.tsx`
- `src/routes/pengaturan/faq.tsx`
- `src/routes/laporan/index.tsx`
