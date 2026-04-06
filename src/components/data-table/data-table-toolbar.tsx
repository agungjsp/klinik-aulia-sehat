import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps {
  children: ReactNode
  className?: string
}

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      {children}
    </div>
  )
}
