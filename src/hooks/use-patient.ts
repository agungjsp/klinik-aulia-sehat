import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { patientService, type PatientCreateRequest, type PatientUpdateRequest, type PatientSearchParams } from "@/services/patient"

export const patientKeys = {
  all: ["patient"] as const,
  list: (params?: PatientSearchParams) => [...patientKeys.all, "list", params] as const,
  detail: (id: number) => [...patientKeys.all, "detail", id] as const,
  nik: (nik: string) => [...patientKeys.all, "nik", nik] as const,
}

export function usePatientList(params?: PatientSearchParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientService.getAll(params),
  })
}

export function usePatientSearch(nik: string | null) {
  return useQuery({
    queryKey: patientKeys.nik(nik || ""),
    queryFn: () => patientService.searchByNik(nik!),
    enabled: !!nik && nik.length >= 16, // Only search when NIK is valid
  })
}

export function usePatientCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PatientCreateRequest) => patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
    },
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

export function usePatientDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
    },
  })
}
