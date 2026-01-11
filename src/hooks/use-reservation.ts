import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reservationService } from "@/services"
import type {
  ReservationCreateRequest,
  ReservationListParams,
  ReservationTransitionAction,
  ReservationUpdateRequest,
} from "@/types"

export const reservationKeys = {
  all: ["reservation"] as const,
  list: (params?: ReservationListParams) => [...reservationKeys.all, "list", params] as const,
  detail: (id: number) => [...reservationKeys.all, "detail", id] as const,
}

export function useReservationList(params?: ReservationListParams) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => reservationService.getAll(params),
    staleTime: 10 * 1000, // 10 seconds - prevents duplicate fetches on navigation
    placeholderData: (previousData) => previousData,
  })
}

export function useReservationDetail(id: number | null) {
  return useQuery({
    queryKey: reservationKeys.detail(id!),
    queryFn: () => reservationService.getById(id!),
    enabled: id !== null,
  })
}

export function useReservationCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReservationCreateRequest) => reservationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

export function useReservationUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReservationUpdateRequest }) =>
      reservationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
    },
  })
}

export function useReservationTransition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: ReservationTransitionAction }) =>
      reservationService.transition(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

// Convenience hooks for specific transitions
export function useReservationToAnamnesa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationService.toAnamnesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

export function useReservationToWaitingDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationService.toWaitingDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

export function useReservationToWithDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationService.toWithDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

export function useReservationToDone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationService.toDone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

export function useReservationToNoShow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationService.toNoShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}

export function useReservationToCancelled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reservationService.toCancelled(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ["queue"] })
    },
  })
}
