import type { ReactNode } from "react"

export type DataTableAlign = "left" | "center" | "right"

export type DataTableSortOrder = "asc" | "desc"

export interface DataTableSortState {
  sortBy?: string
  sortOrder?: DataTableSortOrder
}

export interface DataTableColumn<TData> {
  id: string
  header: ReactNode
  cell: (row: TData) => ReactNode
  align?: DataTableAlign
  widthClassName?: string
  headerClassName?: string
  cellClassName?: string
  sortable?: boolean
  sortKey?: string
}

export interface DataTablePaginationMeta {
  currentPage: number
  totalPages: number
  perPage: number
  totalItems: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

export interface NormalizedPaginatedResponse<TData> {
  items: TData[]
  meta: DataTablePaginationMeta
}
