import { useMemo } from "react"
import { Stethoscope } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useUserList } from "@/hooks"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DoctorSelectProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showIcon?: boolean
  /** Show poly badge next to doctor name */
  showPolyBadge?: boolean
  /** Show "Semua Dokter" option at the top */
  showAll?: boolean
  /** Custom label for "all" option */
  allLabel?: string
}

// Helper to check if poly name indicates "Gigi" (dental)
function isPolyGigi(polyName: string | undefined): boolean {
  if (!polyName) return false
  return polyName.toLowerCase().includes("gigi")
}

export function DoctorSelect({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  showIcon = true,
  showPolyBadge = true,
  showAll = false,
  allLabel,
}: DoctorSelectProps) {
  const { t } = useTranslation(["common", "nav"])
  const resolvedPlaceholder = placeholder ?? t("nav:items.doctorSchedule")
  const resolvedAllLabel = allLabel ?? t("actions.all")

  const { data: usersData, isLoading } = useUserList({ per_page: 1000 })
  
  // Filter users yang memiliki role "Dokter" atau "Doctor" (case insensitive)
  const doctors = useMemo(() => {
    const allUsers = usersData?.data || []
    return allUsers.filter((u) => 
      u.roles?.some((r) => {
        const roleName = r.name?.toLowerCase() || ""
        return roleName === "dokter" || roleName === "doctor"
      })
    )
  }, [usersData?.data])

  if (isLoading) {
    return <Skeleton className={cn("h-10 w-full", className)} />
  }

  // Determine the select value
  const selectValue = value ? String(value) : (showAll ? "__all" : undefined)

  const handleChange = (v: string) => {
    if (v === "__all") {
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
          {showIcon && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
          <SelectValue placeholder={resolvedPlaceholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAll && (
          <SelectItem value="__all">{resolvedAllLabel}</SelectItem>
        )}
        {doctors.length === 0 ? (
          <SelectItem value="__empty" disabled>
            {t("states.noData")}
          </SelectItem>
        ) : (
          doctors.map((doc) => {
            const isDoctorPoliGigi = isPolyGigi(doc.poly?.name)
            return (
              <SelectItem key={doc.id} value={String(doc.id)} className="group/item">
                <div className="flex items-center gap-2">
                  <span>{doc.name}</span>
                  {showPolyBadge && doc.poly && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-medium transition-colors",
                      isDoctorPoliGigi 
                        ? "bg-pink-100 text-pink-700 group-focus/item:bg-pink-500/20 group-focus/item:text-white" 
                        : "bg-muted text-muted-foreground group-focus/item:bg-white/20 group-focus/item:text-white"
                    )}>
                      {doc.poly.name}
                    </span>
                  )}
                </div>
              </SelectItem>
            )
          })
        )}
      </SelectContent>
    </Select>
  )
}
