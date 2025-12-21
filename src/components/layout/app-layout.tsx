import { Sidebar } from "./sidebar"
import { Toaster } from "@/components/ui/sonner"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}
