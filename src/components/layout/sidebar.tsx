import { Link, useRouter } from "@tanstack/react-router"
import { Home, LogOut, Database, Users, Calendar, ClipboardList, Stethoscope, UserCog, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores"
import { authService } from "@/services"
import { ROLES, hasAnyRole } from "@/lib/roles"
import type { LucideIcon } from "lucide-react"

interface MenuItem {
  to: string
  icon: LucideIcon
  label: string
  roles?: string[] // If undefined, visible to all authenticated users
}

interface MenuSection {
  title?: string
  items: MenuItem[]
  roles?: string[] // If undefined, visible to all authenticated users
}

const menuConfig: MenuSection[] = [
  {
    items: [
      { to: "/", icon: Home, label: "Dashboard" },
    ],
  },
  {
    title: "Antrean",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    items: [
      { to: "/antrean", icon: ClipboardList, label: "Semua Antrean" },
      { to: "/jadwal", icon: Calendar, label: "Jadwal Dokter" },
    ],
  },
  {
    items: [
      { to: "/resepsionis/antrean", icon: UserCog, label: "Check-in Pasien", roles: [ROLES.RESEPSIONIS] },
      { to: "/perawat/antrean", icon: Activity, label: "Antrean Anamnesa", roles: [ROLES.PERAWAT] },
      { to: "/dokter/antrean", icon: Stethoscope, label: "Antrean Pasien", roles: [ROLES.DOKTER] },
    ],
  },
  {
    title: "Master Data",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    items: [
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
    return hasAnyRole(userRoles, section.roles as any)
  }

  const canSeeItem = (item: MenuItem) => {
    if (!item.roles) return true
    return hasAnyRole(userRoles, item.roles as any)
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
                  <item.icon className="h-4 w-4" />
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
            <p className="text-xs text-muted-foreground">{user?.roles?.[0]?.name}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
