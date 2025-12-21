import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { scheduleService } from "@/services/schedule"
import type { ScheduleRequest } from "@/types"

interface ScheduleListParams {
  doctor_id?: number
  date?: string
  month?: number
  year?: number
}

export const useScheduleList = (params?: ScheduleListParams) => {
  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => scheduleService.getAll(params),
  })
}

export const useScheduleCreate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ScheduleRequest) => scheduleService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  })
}

export const useScheduleUpdate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScheduleRequest }) =>
      scheduleService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  })
}

export const useScheduleDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => scheduleService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  })
}
