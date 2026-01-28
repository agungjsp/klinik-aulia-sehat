# Sidebar Overlap Root Cause + Fix Plan

## Problem Statement
On admin pages (example: `Konfigurasi WhatsApp`), the main content renders underneath the left sidebar. This makes page content partially hidden and unusable.

## What We Know (From Code + Screenshot Symptoms)

### Sidebar Implementation Model
- The desktop sidebar in `src/components/ui/sidebar.tsx` is rendered as a **fixed** element (`fixed inset-y-0 z-10 ...`) and relies on a **non-fixed spacer div** (`w-[--sidebar-width]`) to reserve horizontal space in the layout.
- If the spacer width becomes `0` (or the sidebar is treated as “mobile overlay mode”), the fixed sidebar will overlap the main content.

### Current Layout Risk
- `src/components/layout/app-layout.tsx` currently includes a custom class attempting to offset the content using Tailwind arbitrary values like `md:pl-[--sidebar-width]`.
- This is **invalid CSS** (it should be `pl-[var(--sidebar-width)]`), so the intended padding-left does not reliably apply.

### Route-Level Layout Confounder
- `src/routes/display/index.tsx` uses `w-screen h-screen` patterns (expected for the TV display screen). That route should **not** share the same admin layout constraints.

## Root Cause Hypotheses (Ranked)

1. **Desktop sidebar spacer is not reserving width**
   - Because the sidebar is fixed, losing the spacer means guaranteed overlap.
   - Causes could be: `data-collapsible="offcanvas"` state, CSS override, or wrong DOM structure.

2. **Sidebar is being rendered in “mobile overlay mode” on desktop**
   - If `useIsMobile()` returns true when it shouldn’t, the sidebar will render as a `Sheet` overlay and not reserve space.

3. **Content container forced to full-viewport width**
   - Less likely on settings pages (they look normal), but can happen via `w-screen`, `fixed`, `absolute`, or `position` utilities on page wrappers.

4. **Invalid / conflicting offset classes in the layout**
   - The current `pl-[--sidebar-width]` attempt doesn’t apply. If the layout depends on it, overlap persists.

## Fix Strategy (Recommended)

### Recommendation: Stop Using Fixed Sidebar On Desktop
Make the desktop sidebar **in-flow** (or `sticky`) instead of `fixed`. This eliminates the fragile “spacer hack” and guarantees the content never renders underneath.

#### Why This Works
- A fixed sidebar always needs a correct offset mechanism.
- A sticky/in-flow sidebar naturally takes space in the flex/grid layout.
- It still allows mobile overlay via `Sheet` when `isMobile === true`.

## Implementation Plan

### Phase 0 — Reproduce + Confirm Root Cause (15-30 min)

1. Reproduce the overlap on a known page:
   - `src/routes/pengaturan/konfigurasi-whatsapp.tsx`

2. In browser DevTools, confirm which sidebar mode is active:
   - Desktop (expected): sidebar rendered as a regular element in layout.
   - Overlay/mobile (unexpected on desktop): sidebar appears as `Sheet`/portal.

3. Inspect DOM for the spacer element:
   - In `src/components/ui/sidebar.tsx` desktop branch, verify the spacer div exists and has width ~`16rem`.
   - If spacer width is `0`, capture why (data attributes / classes / computed styles).

4. Confirm `useIsMobile()` behavior:
   - Inspect `src/hooks/use-mobile.ts` and verify breakpoints.
   - Confirm computed `isMobile` is false at desktop sizes.

Acceptance Criteria:
- Root cause category identified (spacer missing vs wrong mobile mode vs page wrapper forcing width).

### Phase 1 — Replace Desktop Fixed Sidebar With In-Flow/Sticky Layout (Primary Fix)

1. Update `src/components/ui/sidebar.tsx` desktop rendering branch:
   - Remove the fixed-positioned container or convert it to `sticky top-0`.
   - Ensure the sidebar’s width is directly applied to the in-flow element.
   - Keep the mobile branch using `Sheet`.

2. Ensure collapse/expand works without overlap:
   - Collapsed icon mode should reduce the sidebar’s actual width.
   - The content should reflow automatically.

3. Harden the layout container:
   - In `src/components/layout/app-layout.tsx`, ensure the main content area uses `min-w-0` + `flex-1` so it shrinks correctly.
   - Remove ad-hoc left-padding offsets unless strictly needed.

Acceptance Criteria:
- On desktop, the sidebar occupies space and never overlays the content.
- Collapsing the sidebar shrinks layout without hiding content.

### Phase 2 — Route Guardrails (Ensure Display Screen Isolated)

1. Confirm the TV display route (`src/routes/display/index.tsx`) does not use the admin layout.
2. If it currently uses the same layout tree, split layout:
   - Admin layout: sidebar + header.
   - Display layout: full-screen `w-screen h-screen` with no sidebar.

Acceptance Criteria:
- `/display` remains full-screen and unaffected by admin layout changes.
- Admin pages remain sidebar-driven and never full-screen-fixed.

### Phase 3 — Manual Verification Checklist

Run locally:
- `bun dev`

Verify desktop:
- Dashboard page: content starts to the right of sidebar.
- Settings pages: headings, tables, and buttons are fully visible.
- Scroll: sidebar and main area scroll behavior is correct.

Verify collapse:
- Collapse sidebar → content reflows.
- Expand sidebar → content reflows.

Verify mobile (responsive mode in DevTools):
- Sidebar becomes overlay (Sheet).
- Content is never hidden permanently under sidebar.

Verify build:
- `bun run build` passes.

## Fallback Strategy (If You Must Keep Fixed Sidebar)

If product requirements demand a fixed sidebar:
- Ensure spacer width always matches state.
- Ensure content offset uses valid CSS variables:
  - Use `pl-[var(--sidebar-width)]` (not `pl-[--sidebar-width]`).
- Add a “failsafe” desktop offset on the content container.

## Deliverables
- Updated sidebar layout logic (desktop in-flow/sticky).
- Verified no overlap on all admin pages.
- `/display` route unaffected.
