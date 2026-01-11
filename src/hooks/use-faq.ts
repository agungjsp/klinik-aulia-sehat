import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { faqService } from "@/services"

export const faqKeys = {
  all: ["faq"] as const,
  list: () => [...faqKeys.all, "list"] as const,
  detail: (id: number) => [...faqKeys.all, "detail", id] as const,
}

export function useFaqList() {
  return useQuery({
    queryKey: faqKeys.list(),
    queryFn: () => faqService.getAll(),
  })
}

export function useFaqCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; file: File }) => faqService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all })
    },
  })
}

export function useFaqUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; file?: File } }) =>
      faqService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all })
    },
  })
}

export function useFaqDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: faqService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.all })
    },
  })
}
