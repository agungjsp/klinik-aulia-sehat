import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$")({
  component: NotFound,
})

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Halaman tidak ditemukan</p>
    </div>
  )
}
