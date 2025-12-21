import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { polyService } from "@/services"

export const polyKeys = {
  all: ["poly"] as const,
  list: (search?: string) => [...polyKeys.all, "list", search] as const,
  trashed: () => [...polyKeys.all, "trashed"] as const,
  detail: (id: number) => [...polyKeys.all, "detail", id] as const,
}

export function usePolyList(search?: string) {
  return useQuery({
    queryKey: polyKeys.list(search),
    queryFn: () => polyService.getAll(search),
  })
}

export function usePolyTrashed() {
  return useQuery({
    queryKey: polyKeys.trashed(),
    queryFn: () => polyService.getTrashed(),
  })
}

export function usePolyCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: polyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: polyKeys.all })
    },
  })
}

export function usePolyUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      polyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: polyKeys.all })
    },
  })
}

export function usePolyDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: polyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: polyKeys.all })
    },
  })
}

export function usePolyRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: polyService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: polyKeys.all })
    },
  })
}
