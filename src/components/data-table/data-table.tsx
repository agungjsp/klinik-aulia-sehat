import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { cn } from "@/lib/utils"
import type { DataTableAlign, DataTableColumn, DataTableSortState } from "@/types/table"

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[]
  rows: TData[]
  rowKey: (row: TData, index: number) => string | number
  emptyMessage?: string
  loading?: boolean
  loadingRowCount?: number
  variant?: "default" | "comfortable" | "report"
  stickyHeader?: boolean
  wrap?: "nowrap" | "wrap"
  striped?: boolean
  sort?: DataTableSortState
  onSortChange?: (sort: DataTableSortState) => void
  className?: string
}

const ALIGN_CLASS_MAP: Record<DataTableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

function resolveSortIcon(isActive: boolean, order?: DataTableSortState["sortOrder"]) {
  if (!isActive) {
    return <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
  }

  return order === "desc"
    ? <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
    : <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
}

function resolveHeaderAlignClass(align: DataTableAlign) {
  return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
}

function resolveCellAlignClass(align: DataTableAlign) {
  return ALIGN_CLASS_MAP[align]
}

export function DataTable<TData>({
  columns,
  rows,
  rowKey,
  emptyMessage,
  loading = false,
  loadingRowCount = 5,
  variant = "comfortable",
  stickyHeader = false,
  wrap = "nowrap",
  striped,
  sort,
  onSortChange,
  className,
}: DataTableProps<TData>) {
  const { t } = useTranslation(["common"])

  const resolvedEmptyMessage = emptyMessage ?? t("table.noData")

  const handleSort = (column: DataTableColumn<TData>) => {
    if (!column.sortable || !onSortChange) {
      return
    }

    const sortBy = column.sortKey ?? column.id
    const isSameColumn = sort?.sortBy === sortBy
    const nextOrder: DataTableSortState["sortOrder"] = isSameColumn && sort?.sortOrder === "asc" ? "desc" : "asc"

    onSortChange({ sortBy, sortOrder: nextOrder })
  }

  const columnWidths = columns.map((column) => column.widthClassName ?? "w-24")

  if (loading) {
    return (
      <TableSkeleton
        rows={loadingRowCount}
        columns={columns.length}
        columnWidths={columnWidths}
        variant={variant}
      />
    )
  }

  return (
    <Table
      variant={variant}
      stickyHeader={stickyHeader}
      wrap={wrap}
      striped={striped}
      className={className}
    >
      <TableHeader>
        <TableRow>
          {columns.map((column) => {
            const align = column.align ?? "left"
            const sortBy = column.sortKey ?? column.id
            const isSorted = sort?.sortBy === sortBy
            const ariaSort = !column.sortable
              ? undefined
              : isSorted
                ? sort?.sortOrder === "desc"
                  ? "descending"
                  : "ascending"
                : "none"

            return (
              <TableHead
                key={column.id}
                className={cn(
                  column.widthClassName,
                  resolveHeaderAlignClass(align),
                  column.headerClassName,
                )}
                aria-sort={ariaSort}
              >
                {column.sortable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-auto min-h-8 px-1.5 py-1 font-semibold hover:bg-transparent focus-visible:ring-1",
                      align === "right" && "ml-auto",
                      align === "center" && "mx-auto",
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <span>{column.header}</span>
                    <span className="ml-1 text-muted-foreground">
                      {resolveSortIcon(isSorted, sort?.sortOrder)}
                    </span>
                  </Button>
                ) : (
                  <span>{column.header}</span>
                )}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {resolvedEmptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, index) => (
            <TableRow key={rowKey(row, index)}>
              {columns.map((column) => {
                const align = column.align ?? "left"

                return (
                  <TableCell
                    key={column.id}
                    className={cn(
                      resolveCellAlignClass(align),
                      column.cellClassName,
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

interface DataTableActionsProps {
  children: ReactNode
}

export function DataTableActions({ children }: DataTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">{children}</div>
  )
}
