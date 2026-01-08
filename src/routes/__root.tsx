import { Outlet, createRootRoute, redirect, useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAuthStore } from "@/stores"
import { AppLayout } from "@/components/layout"
import { Toaster } from "@/components/ui/sonner"
import { canAccessRoute } from "@/lib/roles"

const publicPaths = ["/login", "/cek-antrean", "/display", "/403", "/no-access"]

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, user } = useAuthStore.getState()
    const isPublicPath = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    )

    if (!isAuthenticated && !isPublicPath) {
      throw redirect({ to: "/login" })
    }

    if (isAuthenticated && !isPublicPath) {
      if (!user?.roles?.length) {
        throw redirect({ to: "/no-access" })
      }
      if (!canAccessRoute(user.roles, location.pathname)) {
        throw redirect({ to: "/403" })
      }
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
    if (isAuthenticated && !isPublicPath) {
      if (!user?.roles?.length) {
        navigate({ to: "/no-access" })
      } else if (!canAccessRoute(user.roles, location.pathname)) {
        navigate({ to: "/403" })
      }
    }
  }, [location.pathname, isAuthenticated, user?.roles, isPublicPath, navigate])

  if (!isAuthenticated || isPublicPath) {
    return (
      <>
        <Outlet />
        <Toaster richColors />
      </>
    )
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
