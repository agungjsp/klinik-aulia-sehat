import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService, type UserCreateRequest, type UserUpdateRequest } from "@/services/user"

export const userKeys = {
  all: ["user"] as const,
  list: (params?: { search?: string; page?: number }) => [...userKeys.all, "list", params] as const,
  trashed: (params?: { search?: string; page?: number }) => [...userKeys.all, "trashed", params] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
}

export function useUserList(params?: { search?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAll(params),
  })
}

export function useUserTrashed(params?: { search?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: userKeys.trashed(params),
    queryFn: () => userService.getTrashed(params),
  })
}

export function useUserCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreateRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUserUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUserDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUserRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
