import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { whatsappConfigService } from "@/services"
import type { WhatsappConfigRequest } from "@/types"

export const whatsappConfigKeys = {
  all: ["whatsappConfig"] as const,
  list: () => [...whatsappConfigKeys.all, "list"] as const,
  detail: (id: number) => [...whatsappConfigKeys.all, "detail", id] as const,
}

export function useWhatsappConfigList() {
  return useQuery({
    queryKey: whatsappConfigKeys.list(),
    queryFn: () => whatsappConfigService.getAll(),
  })
}

export function useWhatsappConfigCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WhatsappConfigRequest) => whatsappConfigService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConfigKeys.all })
    },
  })
}

export function useWhatsappConfigUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WhatsappConfigRequest }) =>
      whatsappConfigService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConfigKeys.all })
    },
  })
}

export function useWhatsappConfigDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: whatsappConfigService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappConfigKeys.all })
    },
  })
}
