import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { configService } from "@/services"
import type { ConfigRequest } from "@/types"

export const configKeys = {
  all: ["config"] as const,
  list: () => [...configKeys.all, "list"] as const,
  detail: (id: number) => [...configKeys.all, "detail", id] as const,
}

export function useConfigList() {
  return useQuery({
    queryKey: configKeys.list(),
    queryFn: () => configService.getAll(),
  })
}

export function useConfigCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ConfigRequest) => configService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all })
    },
  })
}

export function useConfigUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfigRequest }) => configService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all })
    },
  })
}

export function useConfigDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: configService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all })
    },
  })
}
