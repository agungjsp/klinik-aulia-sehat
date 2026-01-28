import { Link, useRouter } from "@tanstack/react-router"
import { Home, LogOut, Database, Users, Calendar, ClipboardList, Stethoscope, Activity, BarChart3, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores"
import { authService } from "@/services"
import { ROLES, hasAnyRole, ROLE_COLORS, getPrimaryRole, type RoleName } from "@/lib/roles"
import type { LucideIcon } from "lucide-react"

interface MenuItem {
  to: string
  icon: LucideIcon
  label: string
  roles?: RoleName[] // If undefined, visible to all authenticated users
}

interface MenuSection {
  title?: string
  items: MenuItem[]
  roles?: RoleName[] // If undefined, visible to all authenticated users
}

const menuConfig: MenuSection[] = [
  {
    items: [
      { to: "/", icon: Home, label: "Dashboard" },
    ],
  },
  // Administrasi section
  {
    title: "Administrasi",
    roles: [ROLES.SUPERADMIN, ROLES.ADMINISTRASI],
    items: [
      { to: "/administrasi/antrean", icon: ClipboardList, label: "Pendaftaran" },
      { to: "/jadwal", icon: Calendar, label: "Jadwal Dokter" },
    ],
  },
  // Perawat Anamnesa section
  {
    title: "Anamnesa",
    roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ANAMNESA],
    items: [
      { to: "/perawat/antrean", icon: Activity, label: "Antrean Anamnesa" },
    ],
  },
  // Perawat Asisten section
  {
    title: "Asisten Dokter",
    roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ASISTEN],
    items: [
      { to: "/perawat-asisten/antrean", icon: UserPlus, label: "Panggil Pasien" },
    ],
  },
  // Dokter section
  {
    title: "Dokter",
    roles: [ROLES.SUPERADMIN, ROLES.DOKTER],
    items: [
      { to: "/dokter/antrean", icon: Stethoscope, label: "Antrean Pasien" },
    ],
  },
  // Kepala Klinik & Superadmin - Laporan
  {
    title: "Laporan",
    roles: [ROLES.SUPERADMIN, ROLES.KEPALA_KLINIK],
    items: [
      { to: "/laporan", icon: BarChart3, label: "Laporan & Analytics" },
    ],
  },
  // Pengaturan - Superadmin only (except Jadwal Kontrol)
  {
    title: "Pengaturan",
    roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ANAMNESA, ROLES.PERAWAT_ASISTEN, ROLES.DOKTER],
    items: [
      { to: "/pengaturan/template-pesan", icon: Database, label: "Template Pesan", roles: [ROLES.SUPERADMIN] },
      { to: "/pengaturan/konfigurasi-pengingat", icon: Database, label: "Konfigurasi Pengingat", roles: [ROLES.SUPERADMIN] },
      { to: "/pengaturan/konfigurasi-whatsapp", icon: Database, label: "Konfigurasi WhatsApp", roles: [ROLES.SUPERADMIN] },
      { to: "/pengaturan/konfigurasi-sistem", icon: Database, label: "Konfigurasi Sistem", roles: [ROLES.SUPERADMIN] },
      { to: "/pengaturan/faq", icon: Database, label: "FAQ", roles: [ROLES.SUPERADMIN] },
      { to: "/pengaturan/jadwal-kontrol", icon: Calendar, label: "Jadwal Kontrol", roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ANAMNESA, ROLES.PERAWAT_ASISTEN, ROLES.DOKTER] },
    ],
  },
  // Master Data - Superadmin only
  {
    title: "Master Data",
    roles: [ROLES.SUPERADMIN],
    items: [
      { to: "/master/pasien", icon: Users, label: "Pasien" },
      { to: "/master/users", icon: Users, label: "Users" },
      { to: "/master/roles", icon: Database, label: "Roles" },
      { to: "/master/poli", icon: Database, label: "Poli" },
    ],
  },
]

export function Sidebar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const userRoles = user?.roles
  const primaryRole = getPrimaryRole(userRoles)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      logout()
      router.navigate({ to: "/login" })
    }
  }

  const canSeeSection = (section: MenuSection) => {
    if (!section.roles) return true
    return hasAnyRole(userRoles, section.roles)
  }

  const canSeeItem = (item: MenuItem) => {
    if (!item.roles) return true
    return hasAnyRole(userRoles, item.roles)
  }

  // Get role badge color
  const getRoleBadgeClass = () => {
    if (!primaryRole) return "bg-gray-100 text-gray-800"
    return ROLE_COLORS[primaryRole] ?? "bg-gray-100 text-gray-800"
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Klinik Aulia Sehat</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuConfig.map((section, idx) => {
          if (!canSeeSection(section)) return null
          const visibleItems = section.items.filter(canSeeItem)
          if (visibleItems.length === 0) return null

          return (
            <div key={idx} className={section.title ? "pt-4" : ""}>
              {section.title && (
                <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                  {section.title}
                </p>
              )}
              {visibleItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    "[&.active]:bg-accent [&.active]:font-medium"
                  )}
                >
                  <item.icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">{user?.name}</p>
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs", getRoleBadgeClass())}>
              {primaryRole ?? "Unknown"}
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
