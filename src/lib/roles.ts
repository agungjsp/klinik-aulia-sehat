// Role names as stored in database
export const ROLES = {
  SUPERADMIN: "Superadmin",
  KEPALA_KLINIK: "Kepala Klinik",
  DOKTER: "Dokter",
  PERAWAT_ANAMNESA: "Perawat Anamnesa",
  PERAWAT_ASISTEN: "Perawat Asisten",
  ADMINISTRASI: "Administrasi",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

// Role-based route access
export const ROLE_ROUTES: Record<RoleName, string[]> = {
  [ROLES.SUPERADMIN]: ["*"], // All routes
  [ROLES.KEPALA_KLINIK]: ["/", "/laporan/*", "/jadwal", "/antrean", "/master/*"],
  [ROLES.DOKTER]: ["/", "/dokter/*"],
  [ROLES.PERAWAT_ANAMNESA]: ["/", "/perawat/*"],
  [ROLES.PERAWAT_ASISTEN]: ["/", "/perawat-asisten/*"],
  [ROLES.ADMINISTRASI]: ["/", "/administrasi/*", "/jadwal"],
}

// Default redirect after login per role
export const ROLE_DEFAULT_ROUTE: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]: "/",
  [ROLES.KEPALA_KLINIK]: "/",
  [ROLES.DOKTER]: "/dokter/antrean",
  [ROLES.PERAWAT_ANAMNESA]: "/perawat/antrean",
  [ROLES.PERAWAT_ASISTEN]: "/perawat-asisten/antrean",
  [ROLES.ADMINISTRASI]: "/administrasi/antrean",
}

// Role display labels (for UI)
export const ROLE_LABELS: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]: "Superadmin",
  [ROLES.KEPALA_KLINIK]: "Kepala Klinik",
  [ROLES.DOKTER]: "Dokter",
  [ROLES.PERAWAT_ANAMNESA]: "Perawat Anamnesa",
  [ROLES.PERAWAT_ASISTEN]: "Perawat Asisten Dokter",
  [ROLES.ADMINISTRASI]: "Administrasi",
}

// Role colors (for badges/UI)
export const ROLE_COLORS: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]: "bg-purple-100 text-purple-800",
  [ROLES.KEPALA_KLINIK]: "bg-blue-100 text-blue-800",
  [ROLES.DOKTER]: "bg-green-100 text-green-800",
  [ROLES.PERAWAT_ANAMNESA]: "bg-orange-100 text-orange-800",
  [ROLES.PERAWAT_ASISTEN]: "bg-yellow-100 text-yellow-800",
  [ROLES.ADMINISTRASI]: "bg-gray-100 text-gray-800",
}

// Check if user has specific role
export const hasRole = (userRoles: { name: string }[] | undefined, roleName: RoleName): boolean => {
  return userRoles?.some(r => r.name === roleName) ?? false
}

// Check if user has any of the specified roles
export const hasAnyRole = (userRoles: { name: string }[] | undefined, roleNames: RoleName[]): boolean => {
  return roleNames.some(roleName => hasRole(userRoles, roleName))
}

// Get user's primary role (first role)
export const getPrimaryRole = (userRoles: { name: string }[] | undefined): RoleName | null => {
  if (!userRoles?.length) return null
  return userRoles[0].name as RoleName
}

// Check if user can access route
export const canAccessRoute = (userRoles: { name: string }[] | undefined, pathname: string): boolean => {
  if (!userRoles?.length) return false
  
  for (const role of userRoles) {
    const allowedRoutes = ROLE_ROUTES[role.name as RoleName]
    if (!allowedRoutes) continue
    
    for (const route of allowedRoutes) {
      if (route === "*") return true
      if (route.endsWith("/*")) {
        const prefix = route.slice(0, -2)
        if (pathname === prefix || pathname.startsWith(prefix + "/")) return true
      } else if (pathname === route) {
        return true
      }
    }
  }
  return false
}

// Get default route for user based on their roles
export const getDefaultRoute = (userRoles: { name: string }[] | undefined): string => {
  const primaryRole = getPrimaryRole(userRoles)
  if (!primaryRole) return "/login"
  return ROLE_DEFAULT_ROUTE[primaryRole] ?? "/"
}

// Check if user is admin-level (can access admin features)
export const isAdminLevel = (userRoles: { name: string }[] | undefined): boolean => {
  return hasAnyRole(userRoles, [ROLES.SUPERADMIN, ROLES.KEPALA_KLINIK])
}
