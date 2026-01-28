# Manual QA Checklist: Sidebar Revamp

## Setup
1. Run `bun dev` to start the application.
2. Open http://localhost:5173 (or the port shown).

## Test Cases

### 1. General Layout & Collapse (Desktop)
- [ ] **Verify Default State**: Sidebar should be expanded by default (or match previous preference).
- [ ] **Verify Collapse**: Click the sidebar trigger (icon top-left). Sidebar should collapse to icon-only mode.
- [ ] **Verify Tooltips**: In collapsed mode, hover over icons.
  - [ ] "Pendaftaran & Antrean" tooltip appears.
  - [ ] "Jadwal Dokter" tooltip appears.
  - [ ] All other visible items show correct tooltips.
- [ ] **Verify Active State**: Navigate to "Jadwal Dokter".
  - [ ] The "Jadwal Dokter" item should be highlighted (different background/font weight).
  - [ ] Collapse the sidebar. The icon for "Jadwal Dokter" should still be highlighted.

### 2. Role: Administrasi
*Login as an Administrasi user.*
- [ ] **Verify Menu Structure**:
  - [ ] **Layanan Hari Ini**: Visible.
    - [ ] "Pendaftaran & Antrean" (ClipboardList icon) -> checks link to `/administrasi/antrean`.
    - [ ] "Jadwal Dokter" (Calendar icon) -> checks link to `/jadwal`.
  - [ ] **Other Sections**: Should NOT be visible (no "Manajemen Klinik", no "Pengaturan Sistem" except maybe logout/profile).
- [ ] **Verify No Empty Sections**: Ensure no section headers appear without items.

### 3. Role: Superadmin
*Login as Superadmin.*
- [ ] **Verify Full Menu**:
  - [ ] **Layanan Hari Ini**: All items visible (Antrean, Panggil Pasien, etc.).
  - [ ] **Laporan & Analytics**: Visible.
  - [ ] **Manajemen Klinik**: Visible (Pasien, Poli, Users, Roles).
  - [ ] **Pengaturan Sistem**: Visible (Template, Pengingat, WhatsApp, Konfigurasi, FAQ).
- [ ] **Verify Icons**: Check that icons are distinct (no repeated "Database" icon).

### 4. Role: Dokter
*Login as Dokter.*
- [ ] **Verify Menu Structure**:
  - [ ] **Layanan Hari Ini**:
    - [ ] "Antrean Pasien"
    - [ ] "Jadwal Kontrol" (Check if this moved correctly).
  - [ ] **Pengaturan**: Should NOT show system settings.

### 5. Mobile Responsive
*Resize browser to mobile width.*
- [ ] **Verify Drawer**: Sidebar becomes a drawer (hidden by default).
- [ ] **Verify Trigger**: Click hamburger menu to open.
- [ ] **Verify Navigation**: Clicking an item navigates and closes the drawer (standard behavior).

## Evidence
- Capture screenshot of **Administrasi Sidebar** (Expanded).
- Capture screenshot of **Superadmin Sidebar** (Collapsed).
