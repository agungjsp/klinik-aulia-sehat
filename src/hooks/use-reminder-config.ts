import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reminderConfigService, type ReminderConfigListParams } from "@/services/reminder-config"
import type { ReminderConfigRequest } from "@/types"

export const reminderConfigKeys = {
  all: ["reminderConfig"] as const,
  list: (params?: ReminderConfigListParams) => [...reminderConfigKeys.all, "list", params] as const,
  detail: (id: number) => [...reminderConfigKeys.all, "detail", id] as const,
}

export function useReminderConfigList(params?: ReminderConfigListParams) {
  return useQuery({
    queryKey: reminderConfigKeys.list(params),
    queryFn: () => reminderConfigService.getAll(params),
  })
}

export function useReminderConfigCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReminderConfigRequest) => reminderConfigService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderConfigKeys.all })
    },
  })
}

export function useReminderConfigUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReminderConfigRequest }) =>
      reminderConfigService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderConfigKeys.all })
    },
  })
}

export function useReminderConfigDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reminderConfigService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderConfigKeys.all })
    },
  })
}
