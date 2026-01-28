# Sidebar Revamp Plan (Reduce Confusion)

## TL;DR

> **Quick Summary**: Simplify the sidebar for day-to-day clinic use by reorganizing navigation around Administrasi tasks, clarifying labels, improving icon meaning, tightening role-based visibility, and making collapse/mobile behavior unambiguous.
>
> **Deliverables**:
> - A clearer `menuConfig` (grouping, ordering, labels, icons) with less clutter per role
> - Improved collapsed state (tooltips, active state clarity, explicit toggle)
> - Manual QA checklist for all roles + desktop/mobile
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO (UI changes are tightly coupled)
> **Critical Path**: Menu inventory → IA restructure → collapse/mobile UX → QA pass

---

## Context

### Original Request
“Sidebar is too confusing the user, please review it and create a plan to improve and revamp it.”

### Interview Summary
- Confusion vectors: can’t find pages, labels unclear, icons not helpful, too many items, collapse behavior confusing, role clutter.
- Primary role to optimize for first: **Administrasi**.
- Scope choice: **UX-only** (labels, grouping, ordering, icons, interaction states) — **no route/path changes**.
- Verification choice: **Manual QA only**.

### Code Touchpoints (References)
- `src/components/layout/app-layout.tsx` - App shell where sidebar is mounted and toggle/provider is wired.
- `src/components/layout/sidebar.tsx` - `AppSidebar` and nav/menu configuration + role filtering.
- `src/components/ui/sidebar.tsx` - shadcn sidebar primitives; collapse behavior; persisted state (cookie).
- `src/lib/roles.ts` - role helpers/constants.
- `src/routes/__root.tsx` - route-level access control helper(s) used to gate pages.

---

## Work Objectives

### Core Objective
Make the sidebar easy to scan and predictable to use for Administrasi, while keeping other roles correct and uncluttered.

### Concrete Deliverables
- Update sidebar menu structure + labels + icons in `src/components/layout/sidebar.tsx`.
- Improve collapse behavior + affordances using `src/components/ui/sidebar.tsx` primitives.
- Ensure role-based visibility and “empty section” handling is consistent.
- Document a manual verification checklist (roles + desktop/mobile) and capture evidence screenshots.

### Definition of Done
- Users can find key pages faster because:
  - Each role sees fewer, better-grouped items
  - Labels match what the page actually is (even if the route path stays unchanged)
  - Icons are distinct and meaningful at-a-glance
  - Collapsing does not hide discoverability (tooltips + clear active state)
- Manual QA checklist passes on desktop + mobile.

### Must NOT Have (Guardrails)
- Do not change route paths or route file names (UX-only).
- Do not introduce new global navigation paradigms (no full command palette unless explicitly added as optional stretch).
- Do not show items a role cannot access; no empty section headers.

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: Not assumed (project notes indicate none)
- **User wants tests**: Manual-only

### Manual QA Evidence
- Start dev server: `bun dev`
- Save screenshots to: `.sisyphus/evidence/sidebar-revamp/`

Role switching for QA: use **seeded accounts** per role.

---

## Proposed Navigation Model (Default)

Administrasi-first, task-ordered, fewer visible section headers:

- Layanan Hari Ini
  - Antrean / Pendaftaran (keep label aligned to what it does; route unchanged)
  - (Optional) Janji/Reservasi
- Pasien
  - Data Pasien
  - (Optional) Riwayat/Rekam Medis
- Klinik
  - (Optional) Jadwal/Poli/Layanan
- Keuangan
  - (Optional) Pembayaran/Tagihan
- Laporan
  - Role-appropriate reports only
- Pengaturan & Master Data
  - Always last; only visible to privileged roles

UX rules:
- Hide empty sections (after role filtering).
- Avoid single-item sections unless it’s a high-importance bucket.
- Use unique icons per top-level group (avoid repeated icons like `Database` across unrelated items).
- In collapsed mode: always show tooltips and a strong active indicator.

---

## TODOs

> Each task includes references and manual acceptance criteria.

- [ ] 1) Inventory current sidebar information architecture

  **What to do**:
  - List all current menu items (label → route) and their role visibility.
  - Identify “label does not match destination” cases (example already suspected: Pendaftaran → antrean route).
  - Identify icon duplication hotspots and sections that are just noise (single item, redundant grouping).

  **References**:
  - `src/components/layout/sidebar.tsx` - source of truth for menu config, labels, icons, grouping, and role filtering.
  - `src/lib/roles.ts` - understand role names/IDs used in filtering.

  **Acceptance Criteria (Manual)**:
  - A short “before map” is written into the PR description or a scratch note for the executor (items per role + pain points).

- [ ] 2) Redesign menuConfig for Administrasi (task-first grouping)

  **What to do**:
  - Re-group and reorder items to match the Proposed Navigation Model.
  - Rename labels to be concrete and consistent (language: keep existing language conventions; prefer short nouns/verbs).
  - Ensure role-based filtering happens before section rendering; sections with 0 visible items are not rendered.
  - Reduce visual noise: merge/remove low-signal section headers.

  **Must NOT do**:
  - Do not change routes/paths (keep link targets).

  **References**:
  - `src/components/layout/sidebar.tsx` - implement new grouping + label naming.
  - `src/routes/__root.tsx` - ensure sidebar visibility assumptions align with route access control.

  **Acceptance Criteria (Manual)**:
  - With Administrasi role, the sidebar shows clearly grouped items with no empty sections.
  - “Findability”: a new user can visually locate Antrean/Pendaftaran and Data Pasien without scrolling on standard laptop viewport.

- [ ] 3) Icon system cleanup (distinct, meaningful icons)

  **What to do**:
  - Assign a consistent icon family (existing lucide set) and ensure top-level groups have distinct icons.
  - Replace duplicated icons that reduce scanability (especially in Pengaturan).
  - Verify icon-only collapsed mode remains understandable via tooltips.

  **References**:
  - `src/components/layout/sidebar.tsx` - where icons are chosen per item.

  **Acceptance Criteria (Manual)**:
  - No more “same icon for different concepts” within the same visible group.
  - Collapsed mode: hovering items shows correct tooltip label for every item.

- [ ] 4) Fix collapse behavior confusion (affordance + active state)

  **What to do**:
  - Ensure there is an explicit, discoverable collapse/expand control.
  - Ensure active route is obvious in both expanded and collapsed states.
  - Ensure tooltips exist in collapsed mode (and are not clipped).
  - Keep default state expanded for desktop (unless current product direction requires otherwise).

  **References**:
  - `src/components/ui/sidebar.tsx` - collapse logic and persisted state (cookie `sidebar:state`).
  - `src/components/layout/app-layout.tsx` - trigger wiring; where controls may live.

  **Acceptance Criteria (Manual)**:
  - Desktop: user can tell whether sidebar is collapsed and how to expand it (no “mystery icon-only” state).
  - Collapsed: every icon shows tooltip on hover; current route is highlighted.

- [ ] 5) Role clutter pass (all roles)

  **What to do**:
  - For each role, ensure only relevant items appear.
  - Ensure no role sees settings/master-data noise unless permitted.
  - Ensure section naming stays stable across roles (avoid reshuffling section order unpredictably).

  **References**:
  - `src/lib/roles.ts` - role list.
  - `src/components/layout/sidebar.tsx` - role-based filtering implementation.
  - `src/routes/__root.tsx` - route access rules.

  **Acceptance Criteria (Manual)**:
  - For each role, sidebar has no empty sections.
  - No item appears that routes the user to a page they cannot access.

- [ ] 6) Manual QA + evidence capture

  **What to do**:
  - Create a repeatable click-through checklist for:
    - Desktop expanded + collapsed
    - Mobile drawer
    - Each role (Administrasi first)
  - Capture screenshots for:
    - Administrasi expanded/collapsed
    - Mobile drawer open
    - One other role for sanity (e.g., Dokter)

  **Acceptance Criteria (Manual)**:
  - `bun dev` runs and sidebar behavior matches expectations.
  - Evidence saved under `.sisyphus/evidence/sidebar-revamp/`.

---

## Decisions Needed

None (role switching confirmed: seeded accounts).

---

## Notes for the Executor

- Keep changes localized to sidebar/layout unless a role/access bug requires touching `src/routes/__root.tsx`.
- Prefer refactoring `menuConfig` into a structure that supports:
  - grouping,
  - per-role visibility,
  - keywords/labels (for future “search in sidebar” if desired),
  - and consistent icon selection.
