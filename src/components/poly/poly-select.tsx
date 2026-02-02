import { useMemo } from "react"
import { Building2 } from "lucide-react"
import { usePolyList } from "@/hooks"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { sortPoliesWithUmumFirst } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface PolySelectProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showIcon?: boolean
  /** Show "Semua Poli" option at the top */
  showAll?: boolean
  /** Custom label for "all" option */
  allLabel?: string
  /** Show "Tidak ada" option (for optional fields) */
  allowNone?: boolean
  /** Custom label for "none" option */
  noneLabel?: string
}

export function PolySelect({
  value,
  onChange,
  placeholder = "Pilih poli",
  disabled = false,
  className,
  showIcon = true,
  showAll = false,
  allLabel = "Semua Poli",
  allowNone = false,
  noneLabel = "Tidak ada",
}: PolySelectProps) {
  const { data: polyData, isLoading } = usePolyList()

  const polies = useMemo(
    () => sortPoliesWithUmumFirst(polyData?.data || []),
    [polyData?.data]
  )

  if (isLoading) {
    return <Skeleton className={cn("h-10 w-full", className)} />
  }

  // Determine the select value
  const selectValue = value ? String(value) : (showAll ? "__all" : (allowNone ? "__none" : undefined))

  const handleChange = (v: string) => {
    if (v === "__all" || v === "__none") {
      onChange(undefined)
    } else {
      onChange(Number(v))
    }
  }

  return (
    <Select
      value={selectValue}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <div className="flex items-center gap-2">
          {showIcon && <Building2 className="h-4 w-4 text-muted-foreground" />}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAll && (
          <SelectItem value="__all">{allLabel}</SelectItem>
        )}
        {allowNone && (
          <SelectItem value="__none">{noneLabel}</SelectItem>
        )}
        {polies.length === 0 ? (
          <SelectItem value="__empty" disabled>
            Tidak ada poli
          </SelectItem>
        ) : (
          polies.map((poly) => (
            <SelectItem key={poly.id} value={String(poly.id)}>
              {poly.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
