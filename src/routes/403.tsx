import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/403")({
  component: Forbidden,
})

function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">403</h1>
      <p className="mt-4 text-xl text-muted-foreground">Akses ditolak</p>
    </div>
  )
}
