import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { patientService, type PatientListParams } from "@/services/patient"
import type { PatientUpdateRequest } from "@/types"

export const patientKeys = {
  all: ["patient"] as const,
  list: (params?: PatientListParams) => [...patientKeys.all, "list", params] as const,
  detail: (id: number) => [...patientKeys.all, "detail", id] as const,
}

export function usePatientList(params?: PatientListParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientService.getAll(params),
  })
}

export function usePatientDetail(id: number | null) {
  return useQuery({
    queryKey: patientKeys.detail(id!),
    queryFn: () => patientService.getById(id!),
    enabled: id !== null,
  })
}

export function usePatientUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatientUpdateRequest }) => patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
    },
  })
}
