import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { roleService } from "@/services"

export const roleKeys = {
  all: ["role"] as const,
  list: (search?: string) => [...roleKeys.all, "list", search] as const,
  trashed: () => [...roleKeys.all, "trashed"] as const,
  detail: (id: number) => [...roleKeys.all, "detail", id] as const,
}

export function useRoleList(search?: string) {
  return useQuery({
    queryKey: roleKeys.list(search),
    queryFn: () => roleService.getAll(search),
  })
}

export function useRoleTrashed() {
  return useQuery({
    queryKey: roleKeys.trashed(),
    queryFn: () => roleService.getTrashed(),
  })
}

export function useRoleCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useRoleUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      roleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useRoleDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useRoleRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: roleService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}
