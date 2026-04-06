import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Pencil, Search } from "lucide-react"
import { usePatientList, usePatientUpdate, useDebouncedValue } from "@/hooks"
import { DataTable, DataTableActions, DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getApiErrorMessage } from "@/lib/api-error"
import type { DataTableColumn, DataTableSortState, Patient } from "@/types"

export const Route = createFileRoute("/master/pasien")({
  component: PasienPage,
})

type PatientForm = {
  patient_name: string
  whatsapp_number: string
  no_bpjs?: string
  email?: string
}

function PasienPage() {
  const { t } = useTranslation(["common", "patient"])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sort, setSort] = useState<DataTableSortState>({ sortBy: "patient_name", sortOrder: "asc" })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [submitPayload, setSubmitPayload] = useState<PatientForm | null>(null)

  const { data: patientData, isLoading, isFetching } = usePatientList({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    sort_by: sort.sortBy,
    sort_order: sort.sortOrder,
  })
  const updateMutation = usePatientUpdate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(
      z.object({
        patient_name: z.string().min(1, t("patient:validation.nameRequired")),
        whatsapp_number: z.string().min(10, t("patient:validation.whatsappMin")),
        no_bpjs: z.string().optional(),
        email: z.string().email(t("patient:validation.emailInvalid")).optional().or(z.literal("")),
      }),
    ),
  })

  const openEditForm = (patient: Patient) => {
    setEditingPatient(patient)
    reset({
      patient_name: patient.patient_name,
      whatsapp_number: patient.whatsapp_number,
      no_bpjs: patient.no_bpjs || "",
      email: patient.email || "",
    })
    setIsFormOpen(true)
  }

  const requestSubmit = handleSubmit(async (data) => {
    setSubmitPayload(data)
  })

  const confirmSubmit = async () => {
    if (!editingPatient || !submitPayload) return
    try {
      await updateMutation.mutateAsync({
        id: editingPatient.id,
        data: {
          patient_name: submitPayload.patient_name,
          whatsapp_number: submitPayload.whatsapp_number,
          no_bpjs: submitPayload.no_bpjs || null,
          email: submitPayload.email || null,
        },
      })
      toast.success(t("patient:toasts.updated"))
      setIsFormOpen(false)
      setSubmitPayload(null)
      reset()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const patients = patientData?.items || []
  const pagination = patientData?.meta

  const columns: DataTableColumn<Patient>[] = [
    {
      id: "patient_name",
      header: t("patient:table.name"),
      sortable: true,
      sortKey: "patient_name",
      cell: (patient) => <span className="font-medium">{patient.patient_name}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "no_bpjs",
      header: t("patient:table.bpjsNumber"),
      sortable: true,
      sortKey: "no_bpjs",
      cell: (patient) => <span className="font-mono text-sm">{patient.no_bpjs || "-"}</span>,
      widthClassName: "min-w-[180px]",
    },
    {
      id: "whatsapp_number",
      header: t("patient:table.whatsappNumber"),
      sortable: true,
      sortKey: "whatsapp_number",
      cell: (patient) => patient.whatsapp_number,
      widthClassName: "min-w-[180px]",
    },
    {
      id: "email",
      header: t("patient:table.email"),
      sortable: true,
      sortKey: "email",
      cell: (patient) => patient.email || "-",
      widthClassName: "min-w-[220px]",
      cellClassName: "min-w-0 truncate",
    },
    {
      id: "actions",
      header: t("patient:table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (patient) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(patient)}
            aria-label={t("patient:table.editAria", { name: patient.patient_name })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DataTableActions>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("patient:page.title")}</h1>
          <p className="text-muted-foreground">
            {t("patient:page.description")}
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`${t("actions.search")} ${t("labels.name").toLowerCase()}...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        rows={patients}
        rowKey={(patient) => patient.id}
        emptyMessage={t("patient:table.empty")}
        loading={isLoading}
        loadingRowCount={5}
        variant="comfortable"
        sort={sort}
        onSortChange={(nextSort) => {
          setSort(nextSort)
          setPage(1)
        }}
      />

      {pagination && pagination.totalItems > 0 && (
        <DataTablePagination
          meta={pagination}
          onPageChange={setPage}
          onPerPageChange={(nextPerPage) => {
            setPerPage(nextPerPage)
            setPage(1)
          }}
          isPending={isFetching}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("patient:form.editTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={requestSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_name">{t("patient:form.fullName")}</Label>
              <Input
                id="patient_name"
                {...register("patient_name")}
                aria-invalid={!!errors.patient_name}
              />
              <p className="text-xs text-muted-foreground">{t("patient:form.fullNameHint")}</p>
              {errors.patient_name && (
                <p className="text-sm text-destructive">{errors.patient_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">{t("patient:form.whatsappNumber")}</Label>
                <Input
                  id="whatsapp_number"
                  {...register("whatsapp_number")}
                  placeholder={t("patient:form.whatsappPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">{t("patient:form.whatsappHint")}</p>
                {errors.whatsapp_number && (
                  <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_bpjs">{t("patient:form.bpjsOptional")}</Label>
                <Input id="no_bpjs" {...register("no_bpjs")} placeholder={t("patient:form.bpjsPlaceholder")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("patient:form.emailOptional")}</Label>
              <Input id="email" type="email" {...register("email")} placeholder={t("patient:form.emailPlaceholder")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("common:actions.cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                {t("common:actions.update")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={submitPayload !== null}
        onOpenChange={(open) => {
          if (!open) setSubmitPayload(null)
        }}
        title={t("patient:confirmSubmit.title")}
        description={t("patient:confirmSubmit.description")}
        entityName={submitPayload?.patient_name || editingPatient?.patient_name}
        impactItems={[
          t("patient:confirmSubmit.impact1"),
          t("patient:confirmSubmit.impact2"),
        ]}
        onConfirm={confirmSubmit}
        confirmText={t("common:actions.save")}
      />
    </div>
  )
}
