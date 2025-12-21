import { Outlet, createRootRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "@/stores"
import { AppLayout } from "@/components/layout"
import { Toaster } from "@/components/ui/sonner"

const publicPaths = ["/login", "/cek-antrean", "/display"]

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState()
    const isPublicPath = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    )

    if (!isAuthenticated && !isPublicPath && location.pathname !== "/") {
      throw redirect({ to: "/login" })
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const { isAuthenticated } = useAuthStore()
  const isPublicPath = publicPaths.some((path) =>
    location.pathname.startsWith(path)
  )

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
