import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import {
  useCheckupScheduleList,
  useCheckupScheduleCreate,
  useCheckupScheduleUpdate,
  useCheckupScheduleDelete,
  useDebouncedValue,
} from "@/hooks"
import { DataTable, DataTableActions, DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PatientAutocomplete } from "@/components/patient"
import { PolySelect } from "@/components/poly"
import { getApiErrorMessage } from "@/lib/api-error"
import type { CheckupSchedule, DataTableColumn, Patient } from "@/types"

export const Route = createFileRoute("/pengaturan/jadwal-kontrol")({
  component: CheckupSchedulePage,
})

type CheckupScheduleForm = {
  patient_id: number
  patient_name: string
  poly_id: number
  date: string
  description?: string
}

function CheckupSchedulePage() {
  const { t } = useTranslation(["checkupSchedule", "common"])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<CheckupSchedule | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: schedulesData, isLoading } = useCheckupScheduleList({
    search: debouncedSearch,
    page,
    per_page: perPage,
  })

  const createMutation = useCheckupScheduleCreate()
  const updateMutation = useCheckupScheduleUpdate()
  const deleteMutation = useCheckupScheduleDelete()

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CheckupScheduleForm>({
    resolver: zodResolver(
      z.object({
        patient_id: z.number().min(1, t("checkupSchedule:validation.patientRequired")),
        patient_name: z.string().min(1, t("checkupSchedule:validation.patientNameRequired")),
        poly_id: z.number().min(1, t("checkupSchedule:validation.polyRequired")),
        date: z.string().min(1, t("checkupSchedule:validation.dateRequired")),
        description: z.string().optional(),
      }),
    ),
    defaultValues: {
      patient_id: 0,
      patient_name: "",
      poly_id: 0,
      date: "",
      description: "",
    },
  })

  const formPolyId = watch("poly_id")

  const openCreateForm = () => {
    setEditingSchedule(null)
    reset({
      patient_id: 0,
      patient_name: "",
      poly_id: 0,
      date: "",
      description: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (schedule: CheckupSchedule) => {
    setEditingSchedule(schedule)
    reset({
      patient_id: schedule.patient_id,
      patient_name: schedule.patient?.patient_name || "",
      poly_id: schedule.poly_id,
      date: schedule.date,
      description: schedule.description,
    })
    setIsFormOpen(true)
  }

  // Handle patient selection from autocomplete
  const handlePatientSelect = (patient: Patient) => {
    setValue("patient_id", patient.id)
    setValue("patient_name", patient.patient_name)
  }

  const onSubmit = async (formData: CheckupScheduleForm) => {
    try {
      const payload = {
        patient_id: formData.patient_id,
        poly_id: formData.poly_id,
        date: formData.date,
        description: formData.description || "",
      }

      if (editingSchedule) {
        await updateMutation.mutateAsync({
          id: editingSchedule.id,
          data: payload,
        })
        toast.success(t("checkupSchedule:toasts.updated"))
      } else {
        await createMutation.mutateAsync(payload)
        toast.success(t("checkupSchedule:toasts.added"))
      }
      setIsFormOpen(false)
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success(t("checkupSchedule:toasts.deleted"))
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const schedules = schedulesData?.items || []
  const pagination = schedulesData?.meta
  const columns: DataTableColumn<CheckupSchedule>[] = [
    {
      id: "patient",
      header: t("checkupSchedule:table.patient"),
      cell: (schedule) => <span className="font-medium">{schedule.patient?.patient_name || "-"}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "poly",
      header: t("checkupSchedule:table.poly"),
      cell: (schedule) => schedule.poly?.name || "-",
      widthClassName: "min-w-[160px]",
    },
    {
      id: "date",
      header: t("checkupSchedule:table.date"),
      cell: (schedule) => schedule.date,
      widthClassName: "w-44",
    },
    {
      id: "description",
      header: t("checkupSchedule:table.description"),
      cell: (schedule) => schedule.description,
      widthClassName: "min-w-[260px]",
      cellClassName: "min-w-0 max-w-md truncate",
    },
    {
      id: "actions",
      header: t("checkupSchedule:table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (schedule) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(schedule)}
            aria-label={t("checkupSchedule:table.editAria", { id: schedule.id })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(schedule.id)}
            aria-label={t("checkupSchedule:table.deleteAria", { id: schedule.id })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </DataTableActions>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("checkupSchedule:page.title")}</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("checkupSchedule:page.addSchedule")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("checkupSchedule:page.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={schedules}
        rowKey={(schedule) => schedule.id}
        loading={isLoading}
        loadingRowCount={5}
        emptyMessage={t("checkupSchedule:table.empty")}
        variant="comfortable"
      />

      {pagination && (
        <DataTablePagination
          meta={pagination}
          onPageChange={setPage}
          onPerPageChange={(nextPerPage) => {
            setPerPage(nextPerPage)
            setPage(1)
          }}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? t("checkupSchedule:form.editTitle") : t("checkupSchedule:form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient Autocomplete */}
            <div className="space-y-2">
              <Label>{t("checkupSchedule:form.patientName")}</Label>
              <Controller
                name="patient_name"
                control={control}
                render={({ field }) => (
                  <PatientAutocomplete
                    value={field.value || ""}
                    onChange={field.onChange}
                    onPatientSelect={handlePatientSelect}
                    placeholder={t("checkupSchedule:form.patientPlaceholder")}
                    disabled={!!editingSchedule}
                  />
                )}
              />
              {errors.patient_id && (
                <p className="text-sm text-destructive">{errors.patient_id.message}</p>
              )}
              {errors.patient_name && (
                <p className="text-sm text-destructive">{errors.patient_name.message}</p>
              )}
            </div>

            {/* Poly Select */}
            <div className="space-y-2">
              <Label>{t("checkupSchedule:form.poly")}</Label>
              <PolySelect
                value={formPolyId || undefined}
                onChange={(value) => {
                  if (value) setValue("poly_id", value)
                }}
                placeholder={t("checkupSchedule:form.polyPlaceholder")}
              />
              {errors.poly_id && (
                <p className="text-sm text-destructive">{errors.poly_id.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">{t("checkupSchedule:form.date")}</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input
                    id="date"
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("checkupSchedule:form.noteOptional")}</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder={t("checkupSchedule:form.notePlaceholder")}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                {t("common:actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingSchedule ? t("common:actions.save") : t("checkupSchedule:form.add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("checkupSchedule:confirmDelete.title")}
        description={t("checkupSchedule:confirmDelete.description")}
        onConfirm={handleDelete}
      />
    </div>
  )
}
