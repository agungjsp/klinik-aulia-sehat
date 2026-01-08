import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/no-access")({
  component: NoAccess,
})

function NoAccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">⚠️</h1>
      <p className="mt-4 text-xl font-semibold">Akun tidak memiliki akses</p>
      <p className="mt-2 text-muted-foreground">Silakan hubungi administrator</p>
    </div>
  )
}
