// Role names as stored in database
export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin", 
  DOKTER: "Dokter",
  PERAWAT: "Perawat",
  RESEPSIONIS: "Resepsionis",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

// Role-based route access
export const ROLE_ROUTES: Record<RoleName, string[]> = {
  [ROLES.SUPER_ADMIN]: ["*"], // All routes
  [ROLES.ADMIN]: ["/", "/master/*", "/jadwal", "/antrean", "/laporan/*"],
  [ROLES.DOKTER]: ["/", "/dokter/*"],
  [ROLES.PERAWAT]: ["/", "/perawat/*"],
  [ROLES.RESEPSIONIS]: ["/", "/resepsionis/*"],
}

// Default redirect after login per role
export const ROLE_DEFAULT_ROUTE: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: "/",
  [ROLES.ADMIN]: "/",
  [ROLES.DOKTER]: "/dokter/antrean",
  [ROLES.PERAWAT]: "/perawat/antrean",
  [ROLES.RESEPSIONIS]: "/resepsionis/antrean",
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
