import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { messageTemplateService, type MessageTemplateListParams } from "@/services/message-template"
import type { MessageTemplateRequest } from "@/types"

export const messageTemplateKeys = {
  all: ["messageTemplate"] as const,
  list: (params?: MessageTemplateListParams) => [...messageTemplateKeys.all, "list", params] as const,
  detail: (id: number) => [...messageTemplateKeys.all, "detail", id] as const,
}

export function useMessageTemplateList(params?: MessageTemplateListParams) {
  return useQuery({
    queryKey: messageTemplateKeys.list(params),
    queryFn: () => messageTemplateService.getAll(params),
  })
}

export function useMessageTemplateCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MessageTemplateRequest) => messageTemplateService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all })
    },
  })
}

export function useMessageTemplateUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MessageTemplateRequest }) =>
      messageTemplateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all })
    },
  })
}

export function useMessageTemplateDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageTemplateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all })
    },
  })
}
