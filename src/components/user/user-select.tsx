import { useMemo } from "react"
import { User } from "lucide-react"
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

interface UserSelectProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showIcon?: boolean
  /** Show "Semua User" option at the top */
  showAll?: boolean
  /** Custom label for "all" option */
  allLabel?: string
  /** Filter by role name (e.g., "Dokter", "Perawat") */
  roleFilter?: string
}

export function UserSelect({
  value,
  onChange,
  placeholder = "Pilih user",
  disabled = false,
  className,
  showIcon = true,
  showAll = false,
  allLabel = "Semua User",
  roleFilter,
}: UserSelectProps) {
  const { data: usersData, isLoading } = useUserList({ per_page: 1000 })

  const users = useMemo(() => {
    const allUsers = usersData?.data || []
    if (!roleFilter) return allUsers
    
    return allUsers.filter((u) =>
      u.roles?.some((r) => {
        const roleName = r.name?.toLowerCase() || ""
        return roleName === roleFilter.toLowerCase()
      })
    )
  }, [usersData?.data, roleFilter])

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
          {showIcon && <User className="h-4 w-4 text-muted-foreground" />}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAll && (
          <SelectItem value="__all">{allLabel}</SelectItem>
        )}
        {users.length === 0 ? (
          <SelectItem value="__empty" disabled>
            Tidak ada user
          </SelectItem>
        ) : (
          users.map((user) => (
            <SelectItem key={user.id} value={String(user.id)}>
              {user.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
