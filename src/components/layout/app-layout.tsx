import { Sidebar } from "./sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground"
        href="#main"
      >
        Lewati ke konten utama
      </a>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6" id="main">
        {children}
      </main>
    </div>
  )
}
