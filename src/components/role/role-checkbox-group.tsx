import { useRoleList } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface RoleCheckboxGroupProps {
  value: number[]
  onChange: (value: number[]) => void
  disabled?: boolean
  className?: string
}

export function RoleCheckboxGroup({
  value,
  onChange,
  disabled = false,
  className,
}: RoleCheckboxGroupProps) {
  const { data: roleData, isLoading } = useRoleList()
  const roles = roleData?.data || []

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
    )
  }

  const handleToggle = (roleId: number, checked: boolean) => {
    if (checked) {
      onChange([...value, roleId])
    } else {
      onChange(value.filter((id) => id !== roleId))
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada role</p>
      ) : (
        roles.map((role) => (
          <label
            key={role.id}
            className={cn(
              "flex items-center gap-2 cursor-pointer select-none rounded-md border px-3 py-2 transition-colors",
              value.includes(role.id)
                ? "border-primary bg-primary/5 text-primary"
                : "border-input bg-background hover:bg-accent",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="checkbox"
              checked={value.includes(role.id)}
              onChange={(e) => handleToggle(role.id, e.target.checked)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={cn(
                "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                value.includes(role.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30"
              )}
            >
              {value.includes(role.id) && (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">{role.name}</span>
          </label>
        ))
      )}
    </div>
  )
}
