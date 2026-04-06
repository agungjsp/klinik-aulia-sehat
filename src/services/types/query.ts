import type { DataTableSortOrder } from "@/types/table"

export interface TableQueryParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: DataTableSortOrder
}
