import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { checkupScheduleService } from "@/services"
import type { CheckupScheduleListParams, CheckupScheduleRequest } from "@/types"

export const checkupScheduleKeys = {
  all: ["checkupSchedule"] as const,
  list: (params?: CheckupScheduleListParams) => [...checkupScheduleKeys.all, "list", params] as const,
  detail: (id: number) => [...checkupScheduleKeys.all, "detail", id] as const,
}

export function useCheckupScheduleList(params?: CheckupScheduleListParams) {
  return useQuery({
    queryKey: checkupScheduleKeys.list(params),
    queryFn: () => checkupScheduleService.getAll(params),
  })
}

export function useCheckupScheduleCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CheckupScheduleRequest) => checkupScheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkupScheduleKeys.all })
    },
  })
}

export function useCheckupScheduleUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CheckupScheduleRequest }) =>
      checkupScheduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkupScheduleKeys.all })
    },
  })
}

export function useCheckupScheduleDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkupScheduleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkupScheduleKeys.all })
    },
  })
}
