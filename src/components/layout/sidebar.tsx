import { Link, useRouter, useLocation } from "@tanstack/react-router"
import {
  Home,
  LogOut,
  Users,
  Calendar,
  ClipboardList,
  Stethoscope,
  Activity,
  BarChart3,
  UserPlus,
  ChevronDown,
  UserCog,
  Shield,
  Building2,
  MessageSquare,
  Bell,
  Smartphone,
  Settings,
  HelpCircle,
  CalendarClock
} from "lucide-react"
import { useAuthStore } from "@/stores"
import { authService } from "@/services"
import { ROLES, hasAnyRole, getPrimaryRole, type RoleName } from "@/lib/roles"
import type { LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MenuItem {
  to: string
  icon: LucideIcon
  label: string
  roles?: RoleName[]
}

interface MenuSection {
  title?: string
  items: MenuItem[]
  roles?: RoleName[]
}

const menuConfig: MenuSection[] = [
  {
    items: [
      { to: "/", icon: Home, label: "Dashboard" },
    ],
  },
  {
    title: "Layanan Hari Ini",
    items: [
      { 
        to: "/administrasi/antrean", 
        icon: ClipboardList, 
        label: "Pendaftaran & Antrean", 
        roles: [ROLES.SUPERADMIN, ROLES.ADMINISTRASI] 
      },
      { 
        to: "/perawat/antrean", 
        icon: Activity, 
        label: "Antrean Anamnesa", 
        roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ANAMNESA] 
      },
      { 
        to: "/perawat-asisten/antrean", 
        icon: UserPlus, 
        label: "Panggil Pasien", 
        roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ASISTEN] 
      },
      { 
        to: "/dokter/antrean", 
        icon: Stethoscope, 
        label: "Antrean Pasien", 
        roles: [ROLES.SUPERADMIN, ROLES.DOKTER] 
      },
      { 
        to: "/jadwal", 
        icon: Calendar, 
        label: "Jadwal Dokter", 
        roles: [ROLES.SUPERADMIN, ROLES.ADMINISTRASI, ROLES.KEPALA_KLINIK] 
      },
      { 
        to: "/pengaturan/jadwal-kontrol", 
        icon: CalendarClock, 
        label: "Jadwal Kontrol", 
        roles: [ROLES.SUPERADMIN, ROLES.DOKTER, ROLES.PERAWAT_ANAMNESA, ROLES.PERAWAT_ASISTEN] 
      },
    ],
  },
  {
    title: "Laporan & Analytics",
    roles: [ROLES.SUPERADMIN, ROLES.KEPALA_KLINIK],
    items: [
      { to: "/laporan", icon: BarChart3, label: "Ringkasan Laporan" },
    ],
  },
  {
    title: "Manajemen Klinik",
    roles: [ROLES.SUPERADMIN],
    items: [
      { to: "/master/pasien", icon: Users, label: "Data Pasien" },
      { to: "/master/poli", icon: Building2, label: "Poliklinik" },
      { to: "/master/users", icon: UserCog, label: "Manajemen User" },
      { to: "/master/roles", icon: Shield, label: "Akses & Roles" },
    ],
  },
  {
    title: "Pengaturan Sistem",
    roles: [ROLES.SUPERADMIN],
    items: [
      { to: "/pengaturan/template-pesan", icon: MessageSquare, label: "Template Pesan" },
      { to: "/pengaturan/konfigurasi-pengingat", icon: Bell, label: "Pengingat" },
      { to: "/pengaturan/konfigurasi-whatsapp", icon: Smartphone, label: "WhatsApp" },
      { to: "/pengaturan/konfigurasi-sistem", icon: Settings, label: "Konfigurasi Umum" },
      { to: "/pengaturan/faq", icon: HelpCircle, label: "Bantuan & FAQ" },
    ],
  },
]

export function AppSidebar() {
  const router = useRouter()
  const location = useLocation()
  const pathname = location.pathname
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

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">Klinik Aulia Sehat</span>
            <span className="truncate text-xs">Sistem Informasi</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuConfig.map((section, idx) => {
          if (!canSeeSection(section)) return null
          const visibleItems = section.items.filter(canSeeItem)
          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={idx}>
              {section.title && (
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = item.to === "/" 
                      ? pathname === "/" 
                      : pathname.startsWith(item.to)
                    
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                          <Link to={item.to}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) ?? "U"}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{primaryRole ?? "User"}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
