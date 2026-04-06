import type { PaginatedDataResponse, PaginatedResponse } from "@/types"
import type { NormalizedPaginatedResponse } from "@/types/table"

type SupportedPaginatedResponse<TData> = PaginatedDataResponse<TData> | PaginatedResponse<TData>

function isPaginatedDataResponse<TData>(
  response: SupportedPaginatedResponse<TData>,
): response is PaginatedDataResponse<TData> {
  return !Array.isArray((response as PaginatedResponse<TData>).data)
}

export function normalizePaginatedResponse<TData>(
  response: SupportedPaginatedResponse<TData>,
): NormalizedPaginatedResponse<TData> {
  if (isPaginatedDataResponse(response)) {
    const payload = response.data
    const currentPage = payload.current_page ?? 1
    const totalPages = payload.last_page ?? 1
    const perPage = payload.per_page ?? payload.data.length
    const totalItems = payload.total ?? payload.data.length

    return {
      items: payload.data,
      meta: {
        currentPage,
        totalPages,
        perPage,
        totalItems,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
    }
  }

  const payload = response.data
  const meta = response.meta
  const currentPage = meta?.current_page ?? 1
  const totalPages = meta?.last_page ?? 1
  const perPage = meta?.per_page ?? payload.length
  const totalItems = meta?.total ?? payload.length

  return {
    items: payload,
    meta: {
      currentPage,
      totalPages,
      perPage,
      totalItems,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  }
}
