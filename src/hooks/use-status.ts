import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { statusService } from "@/services"
import type { StatusRequest } from "@/types"

export const statusKeys = {
  all: ["status"] as const,
  list: (search?: string) => [...statusKeys.all, "list", search] as const,
  trashed: () => [...statusKeys.all, "trashed"] as const,
  detail: (id: number) => [...statusKeys.all, "detail", id] as const,
}

export function useStatusList(search?: string) {
  return useQuery({
    queryKey: statusKeys.list(search),
    queryFn: () => statusService.getAll(search),
  })
}

export function useStatusTrashed() {
  return useQuery({
    queryKey: statusKeys.trashed(),
    queryFn: () => statusService.getTrashed(),
  })
}

export function useStatusCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StatusRequest) => statusService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}

export function useStatusUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StatusRequest }) => statusService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}

export function useStatusDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: statusService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}

export function useStatusRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: statusService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusKeys.all })
    },
  })
}
