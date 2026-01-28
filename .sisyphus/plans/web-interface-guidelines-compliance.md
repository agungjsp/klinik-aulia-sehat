# Web Interface Guidelines Compliance (Critical Shells)

## TL;DR

> **Quick Summary**: Audit and remediate key UI entry points and shared UI primitives to comply with Vercel Web Interface Guidelines, focusing on accessibility, motion, copy, and interaction safety.
>
> **Deliverables**:
> - A targeted guideline compliance pass for app shell + login + layout + key `src/components/ui/**` primitives
> - Fixes for identified issues (copy ellipses, skip link, icon a11y, `transition-all`, reduced-motion, overscroll contain)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES (2 waves)
> **Critical Path**: App shell semantics (lang/title, skip link) → shared UI primitives (motion/transition/focus) → login copy/autocomplete

---

## Context

### Original Request
"please review it and create a plan"

### Scope (Selected)
- Document shell: `index.html`
- App entry: `src/main.tsx`, `src/App.tsx`
- Router root + login: `src/routes/__root.tsx`, `src/routes/login.tsx`
- Layout: `src/components/layout/app-layout.tsx`, `src/components/layout/sidebar.tsx`
- UI primitives (priority set):
  - `src/components/ui/button.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/tabs.tsx`
  - `src/components/ui/input.tsx`, `src/components/ui/label.tsx`, `src/components/ui/textarea.tsx`
  - `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/alert-dialog.tsx`
  - `src/components/ui/select.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/tooltip.tsx`, `src/components/ui/combobox.tsx`
  - `src/components/ui/sonner.tsx`, `src/components/ui/confirm-dialog.tsx`

### Findings (Terse `file:line`)
- `index.html:2` - `lang="en"` but UI copy appears Indonesian; likely should be `lang="id"`
- `index.html:7` - `<title>` is generic (`vite-app`)
- `src/routes/__root.tsx` + `src/components/layout/app-layout.tsx` - both render Toaster (potential duplication)
- `src/routes/login.tsx:81` - placeholder does not end with ellipsis `…`
- `src/routes/login.tsx:95` - placeholder does not end with ellipsis `…`
- `src/routes/login.tsx:112` - loading text uses `...` instead of `…`
- `src/routes/login.tsx` - username/password inputs missing explicit `autoComplete` hints
- `src/components/layout/app-layout.tsx` - missing skip link + skip target wiring
- `src/components/layout/sidebar.tsx:47-57` - decorative icons likely missing `aria-hidden="true"`
- `src/components/ui/button.tsx:8` - uses `transition-all`
- `src/components/ui/badge.tsx:8` - uses `transition-all` (also duplicates transition classes)
- `src/components/ui/tabs.tsx:30` - uses `transition-all`
- `src/components/ui/dialog.tsx` / `src/components/ui/sheet.tsx` / `src/components/ui/alert-dialog.tsx` - animations without reduced-motion variants; add overscroll contain where scrolling can occur
- `src/components/ui/select.tsx:75-78` - prevents default on close autofocus (intentional), but must confirm focus management stays accessible
- `src/components/ui/combobox.tsx:265` - `outline-none` on chips input; ensure visible focus remains via `focus-within` on container

### Notes / Defaults Applied (override if wrong)
- Default document language: `lang="id"`
- Default page title: "Klinik Aulia Sehat" (based on repo folder name)

### Metis Review
- Metis consultation could not be completed due to tool errors (plan proceeds with an explicit self-review section and conservative guardrails).

---

## Work Objectives

### Core Objective
Bring the selected UI surface area into compliance with Vercel Web Interface Guidelines without redesigning the UI.

### Definition of Done
- `bun run lint` passes
- `bun run build` passes
- Manual verification steps in each TODO completed (keyboard navigation, reduced-motion, scroll containment, copy)

### Must NOT Have (Guardrails)
- No redesign / layout overhaul beyond what is needed for compliance
- No changes to business logic, API calls, or auth behavior (unless required to fix a11y regressions)
- No sweeping refactors outside the selected scope (record out-of-scope findings separately)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (per `AGENTS.md`)
- **User wants tests**: Manual-only

### Standard Verification Commands
```bash
bun run lint
bun run build
bun dev
```

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Shell & Core A11y):
- Task 1, 2, 3

Wave 2 (UI primitives: motion/transition/focus):
- Task 4, 5, 6

---

## TODOs

### 1) Document Shell: Language + Title

**What to do**:
- Update `index.html`:
  - Set `<html lang="id">` (or confirm correct language)
  - Set a real `<title>` (default: "Klinik Aulia Sehat")

**References**:
- `index.html:2` - lang attribute
- `index.html:7` - title

**Acceptance Criteria**:
- `index.html:2` uses correct language code
- `index.html:7` uses non-generic title
- Manual: run `bun dev` and confirm browser tab title updates

---

### 2) Toast Placement: Ensure Single Toaster

**What to do**:
- Ensure Toaster is rendered exactly once for the app (pick either `src/routes/__root.tsx` or `src/components/layout/app-layout.tsx`)
- Verify toasts remain visible on both authenticated and public routes

**References**:
- `src/routes/__root.tsx` - Toaster present for unauth/public
- `src/components/layout/app-layout.tsx` - Toaster present in layout
- `src/components/ui/sonner.tsx` - Toaster component implementation

**Acceptance Criteria**:
- App renders a single Toaster instance (no duplicate stacks)
- Manual: trigger a toast in an authed screen + in login flow and verify it appears once

---

### 3) Skip Link + Main Target Wiring

**What to do**:
- Add a skip link at the top of the app shell (typically in `src/components/layout/app-layout.tsx`)
  - Link target should point to the main content region (`id="main"` or similar)
  - Ensure skip link is visually hidden until focused, then visible

**References**:
- `src/components/layout/app-layout.tsx` - owns `<main>` container

**Acceptance Criteria**:
- Keyboard-only: first Tab focuses the skip link; Enter moves focus to main content
- Screen reader: skip link has meaningful text (Indonesian is fine)
- No layout shift beyond the skip link reveal

---

### 4) Login Form Copy + Autocomplete

**What to do**:
- Update placeholders to end with ellipsis `…` (not `...`)
- Update loading state copy to use ellipsis `…`
- Add explicit input `autoComplete` hints:
  - username field: `autoComplete="username"`
  - password field: `autoComplete="current-password"`

**References**:
- `src/routes/login.tsx:81` - username placeholder
- `src/routes/login.tsx:95` - password placeholder
- `src/routes/login.tsx:112` - loading state text

**Acceptance Criteria**:
- Placeholders end with `…`
- Loading text uses `…`
- Manual: in browser, click username/password; verify autocomplete suggestions behave sensibly (as supported by browser)

---

### 5) Icon Accessibility: Decorative Icons Are Hidden

**What to do**:
- Ensure decorative icons inside buttons/links have `aria-hidden="true"` (and do not receive focus)
- Confirm icon-only controls have accessible names (sr-only text or `aria-label`)

**References**:
- `src/components/layout/sidebar.tsx:47-57` - menu item icon
- `src/components/ui/dialog.tsx` / `src/components/ui/sheet.tsx` - close button icons already include sr-only text; keep that pattern

**Acceptance Criteria**:
- Screen reader does not announce decorative icons redundantly
- Keyboard navigation: no stray focus stops on SVGs

---

### 6) Shared Motion + Transitions (Reduce Motion + No `transition-all`)

**What to do**:
- Replace `transition-all` with property-specific transitions:
  - `src/components/ui/button.tsx:8`
  - `src/components/ui/badge.tsx:8`
  - `src/components/ui/tabs.tsx:30`
- Add reduced-motion variants to animated overlays/popups:
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/sheet.tsx`
  - `src/components/ui/alert-dialog.tsx`
  - `src/components/ui/select.tsx` (content)
  - `src/components/ui/dropdown-menu.tsx` (content)
  - `src/components/ui/tooltip.tsx` (content)
  - `src/components/ui/combobox.tsx` (popup)
- Add `overscroll-contain` where scrollable popups/modals exist to prevent body scroll chaining

**References**:
- `src/components/ui/button.tsx:8` - `transition-all`
- `src/components/ui/badge.tsx:8` - `transition-all` + duplicated transition classes
- `src/components/ui/tabs.tsx:30` - `transition-all`
- `src/components/ui/alert-dialog.tsx:36,56` - animations
- `src/components/ui/select.tsx:70-72` - content classes and focus handling
- `src/components/ui/dropdown-menu.tsx:40-46` - content classes
- `src/components/ui/tooltip.tsx:48-56` - content classes
- `src/components/ui/combobox.tsx:112-118` - popup classes; list already uses `overscroll-contain`

**Acceptance Criteria**:
- No `transition-all` remains in the in-scope primitives (button/badge/tabs)
- Manual: toggle OS / devtools reduced-motion (prefers-reduced-motion) and confirm dialogs/menus do not animate
- Manual: open a long menu/select list and overscroll; page behind does not scroll

---

## Out of Scope (Recorded for Later)

These were detected but not included due to the selected scope:
- `transition-all` occurrences in:
  - `src/components/schedule/schedule-picker.tsx`
  - `src/routes/index.tsx`
  - `src/routes/laporan/index.tsx`

---

## Commit Strategy

- Suggested: 1 commit for shell/a11y + 1 commit for primitives motion/transition
- Message style: `fix(ui): align with web interface guidelines`

---

## Success Criteria

- UI remains keyboard-navigable with visible focus
- Reduced-motion users are not forced through animations
- Form copy follows ellipsis rules and autocomplete hints are set
- No duplicated toasts
