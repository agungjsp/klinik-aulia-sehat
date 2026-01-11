import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardSkeletonProps {
  /**
   * Whether to show the card header
   * @default true
   */
  showHeader?: boolean
  /**
   * Number of content lines to render
   * @default 3
   */
  lines?: number
  /**
   * Additional className for the card
   */
  className?: string
}

export function CardSkeleton({
  showHeader = true,
  lines = 3,
  className,
}: CardSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${75 + Math.random() * 25}%` }}
          />
        ))}
      </CardContent>
    </Card>
  )
}

interface SummaryCardSkeletonProps {
  className?: string
}

export function SummaryCardSkeleton({ className }: SummaryCardSkeletonProps) {
  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <Skeleton className="h-8 w-12 mt-2" />
      </CardContent>
    </Card>
  )
}

interface ChartSkeletonProps {
  className?: string
  height?: string
}

export function ChartSkeleton({ className, height = "h-64" }: ChartSkeletonProps) {
  return (
    <div className={cn("flex items-end justify-between gap-1", height, className)}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${20 + Math.random() * 80}%` }}
        />
      ))}
    </div>
  )
}
