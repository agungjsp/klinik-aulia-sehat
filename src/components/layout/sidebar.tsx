import { Link, useRouter, useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
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
  labelKey: string
  roles?: RoleName[]
}

interface MenuSection {
  titleKey?: string
  items: MenuItem[]
  roles?: RoleName[]
}

const menuConfig: MenuSection[] = [
  {
    items: [
      { to: "/", icon: Home, labelKey: "nav:items.dashboard" },
    ],
  },
  {
    titleKey: "nav:sections.todayServices",
    items: [
      { 
        to: "/administrasi/antrean", 
        icon: ClipboardList, 
        labelKey: "nav:items.registrationQueue",
        roles: [ROLES.SUPERADMIN, ROLES.ADMINISTRASI] 
      },
      { 
        to: "/perawat/antrean", 
        icon: Activity, 
        labelKey: "nav:items.anamnesisQueue",
        roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ANAMNESA] 
      },
      { 
        to: "/perawat-asisten/antrean", 
        icon: UserPlus, 
        labelKey: "nav:items.callPatient",
        roles: [ROLES.SUPERADMIN, ROLES.PERAWAT_ASISTEN] 
      },
      { 
        to: "/dokter/antrean", 
        icon: Stethoscope, 
        labelKey: "nav:items.patientQueue",
        roles: [ROLES.SUPERADMIN, ROLES.DOKTER] 
      },
      { 
        to: "/jadwal", 
        icon: Calendar, 
        labelKey: "nav:items.doctorSchedule",
        roles: [ROLES.SUPERADMIN, ROLES.ADMINISTRASI, ROLES.KEPALA_KLINIK] 
      },
      { 
        to: "/pengaturan/jadwal-kontrol", 
        icon: CalendarClock, 
        labelKey: "nav:items.checkupSchedule",
        roles: [ROLES.SUPERADMIN, ROLES.DOKTER, ROLES.PERAWAT_ANAMNESA, ROLES.PERAWAT_ASISTEN] 
      },
    ],
  },
  {
    titleKey: "nav:sections.reports",
    roles: [ROLES.SUPERADMIN, ROLES.KEPALA_KLINIK],
    items: [
      { to: "/laporan", icon: BarChart3, labelKey: "nav:items.reportSummary" },
    ],
  },
  {
    titleKey: "nav:sections.clinicManagement",
    roles: [ROLES.SUPERADMIN],
    items: [
      { to: "/master/pasien", icon: Users, labelKey: "nav:items.patientData" },
      { to: "/master/poli", icon: Building2, labelKey: "nav:items.polyclinic" },
      { to: "/master/users", icon: UserCog, labelKey: "nav:items.userManagement" },
      { to: "/master/roles", icon: Shield, labelKey: "nav:items.accessRoles" },
    ],
  },
  {
    titleKey: "nav:sections.systemSettings",
    roles: [ROLES.SUPERADMIN],
    items: [
      { to: "/pengaturan/template-pesan", icon: MessageSquare, labelKey: "nav:items.messageTemplate" },
      { to: "/pengaturan/konfigurasi-pengingat", icon: Bell, labelKey: "nav:items.reminders" },
      { to: "/pengaturan/konfigurasi-whatsapp", icon: Smartphone, labelKey: "nav:items.whatsapp" },
      { to: "/pengaturan/konfigurasi-sistem", icon: Settings, labelKey: "nav:items.generalConfig" },
      { to: "/pengaturan/faq", icon: HelpCircle, labelKey: "nav:items.helpFaq" },
    ],
  },
]

export function AppSidebar() {
  const { t } = useTranslation(["nav"])
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
            <span className="truncate font-semibold">{t("common:appName")}</span>
            <span className="truncate text-xs">{t("nav:brand.subtitle")}</span>
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
              {section.titleKey && (
                <SidebarGroupLabel>{t(section.titleKey)}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = item.to === "/" 
                      ? pathname === "/" 
                      : pathname.startsWith(item.to)
                    
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild tooltip={t(item.labelKey)} isActive={isActive}>
                          <Link to={item.to}>
                            <item.icon />
                            <span>{t(item.labelKey)}</span>
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
                    <span className="truncate text-xs">{primaryRole ?? t("nav:footer.userFallback")}</span>
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
                  {t("nav:footer.logout")}
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
