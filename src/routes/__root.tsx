import { Outlet, createRootRoute, redirect, useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAuthStore } from "@/stores"
import { AppLayout } from "@/components/layout"
import { Toaster } from "@/components/ui/sonner"
import { canAccessRoute } from "@/lib/roles"

const publicPaths = ["/login", "/cek-antrean", "/display"]

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, user } = useAuthStore.getState()
    const isPublicPath = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    )

    if (!isAuthenticated && !isPublicPath) {
      throw redirect({ to: "/login" })
    }

    // Role-based access check
    if (isAuthenticated && !isPublicPath && !canAccessRoute(user?.roles, location.pathname)) {
      throw redirect({ to: "/" })
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()
  const isPublicPath = publicPaths.some((path) =>
    location.pathname.startsWith(path)
  )

  // Client-side route guard (for SPA navigation)
  useEffect(() => {
    if (isAuthenticated && !isPublicPath && !canAccessRoute(user?.roles, location.pathname)) {
      navigate({ to: "/" })
    }
  }, [location.pathname, isAuthenticated, user?.roles, isPublicPath, navigate])

  if (!isAuthenticated || isPublicPath) {
    return (
      <>
        <Outlet />
        <Toaster position="top-right" richColors />
      </>
    )
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
