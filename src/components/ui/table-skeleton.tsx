import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  /**
   * Number of rows to render
   * @default 5
   */
  rows?: number
  /**
   * Number of columns to render
   * @default 4
   */
  columns?: number
  /**
   * Whether to show the table header
   * @default true
   */
  showHeader?: boolean
  /**
   * Column widths configuration (tailwind width classes)
   * @example ["w-16", "w-32", "w-24", "w-20"]
   */
  columnWidths?: string[]
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  columnWidths,
}: TableSkeletonProps) {
  const getColumnWidth = (index: number) => {
    if (columnWidths && columnWidths[index]) {
      return columnWidths[index]
    }
    // Default widths based on column position
    if (index === 0) return "w-12"
    if (index === columns - 1) return "w-16"
    return "w-24"
  }

  return (
    <Table>
      {showHeader && (
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <TableHead key={colIdx}>
                <Skeleton className={`h-4 ${getColumnWidth(colIdx)}`} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <TableRow key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <TableCell key={colIdx}>
                <Skeleton className={`h-4 ${getColumnWidth(colIdx)}`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface TableRowSkeletonProps {
  columns?: number
  columnWidths?: string[]
}

export function TableRowSkeleton({
  columns = 4,
  columnWidths,
}: TableRowSkeletonProps) {
  const getColumnWidth = (index: number) => {
    if (columnWidths && columnWidths[index]) {
      return columnWidths[index]
    }
    if (index === 0) return "w-12"
    if (index === columns - 1) return "w-16"
    return "w-24"
  }

  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, colIdx) => (
        <TableCell key={colIdx}>
          <Skeleton className={`h-4 ${getColumnWidth(colIdx)}`} />
        </TableCell>
      ))}
    </TableRow>
  )
}
