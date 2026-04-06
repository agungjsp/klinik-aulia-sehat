import { PaginationControls } from "@/components/ui/pagination-controls"
import type { DataTablePaginationMeta } from "@/types/table"

interface DataTablePaginationProps {
  meta: DataTablePaginationMeta
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isPending?: boolean
}

export function DataTablePagination({
  meta,
  onPageChange,
  onPerPageChange,
  isPending = false,
}: DataTablePaginationProps) {
  return (
    <PaginationControls
      currentPage={meta.currentPage}
      totalPages={meta.totalPages}
      onPageChange={onPageChange}
      perPage={meta.perPage}
      onPerPageChange={onPerPageChange}
      totalItems={meta.totalItems}
      isPending={isPending}
    />
  )
}
