import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Klinik Aulia Sehat</h1>
    </div>
  )
}
