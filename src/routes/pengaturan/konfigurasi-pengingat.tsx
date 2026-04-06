import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useReminderConfigList,
  useReminderConfigCreate,
  useReminderConfigUpdate,
  useReminderConfigDelete,
  useMessageTemplateList,
} from "@/hooks"
import { DataTable, DataTableActions, DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-error"
import type { DataTableColumn, ReminderConfig } from "@/types"

export const Route = createFileRoute("/pengaturan/konfigurasi-pengingat")({
  component: ReminderConfigPage,
})

type ReminderConfigForm = {
  message_template_id: number
  reminder_offset: number
  reminder_patient_count: number
  reminder_type: string
}

function ReminderConfigPage() {
  const { t } = useTranslation(["reminderConfig", "common"])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ReminderConfig | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [submitPayload, setSubmitPayload] = useState<ReminderConfigForm | null>(null)

  const { data: configsData, isLoading } = useReminderConfigList({
    page,
    per_page: perPage,
  })

  const { data: templatesData } = useMessageTemplateList({
    per_page: 100,
  })

  const createMutation = useReminderConfigCreate()
  const updateMutation = useReminderConfigUpdate()
  const deleteMutation = useReminderConfigDelete()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReminderConfigForm>({
    resolver: zodResolver(
      z.object({
        message_template_id: z.number().min(1, t("reminderConfig:validation.messageTemplateRequired")),
        reminder_offset: z.number().min(0, t("reminderConfig:validation.offsetRequired")),
        reminder_patient_count: z.number().min(1, t("reminderConfig:validation.patientCountRequired")),
        reminder_type: z.string().min(1, t("reminderConfig:validation.typeRequired")),
      }),
    ),
    defaultValues: {
      message_template_id: 0,
      reminder_offset: 0,
      reminder_patient_count: 1,
      reminder_type: "QUEUE",
    },
  })

  const templates = templatesData?.items || []

  const openCreateForm = () => {
    setEditingConfig(null)
    reset({
      message_template_id: 0,
      reminder_offset: 0,
      reminder_patient_count: 1,
      reminder_type: "QUEUE",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (config: ReminderConfig) => {
    setEditingConfig(config)
    reset({
      message_template_id: config.message_template_id,
      reminder_offset: config.reminder_offset,
      reminder_patient_count: config.reminder_patient_count,
      reminder_type: config.reminder_type,
    })
    setIsFormOpen(true)
  }

  const requestSubmit = (formData: ReminderConfigForm) => {
    setSubmitPayload(formData)
  }

  const confirmSubmit = async () => {
    if (!submitPayload) return
    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({
          id: editingConfig.id,
          data: submitPayload,
        })
        toast.success(t("reminderConfig:toasts.updated"))
      } else {
        await createMutation.mutateAsync(submitPayload)
        toast.success(t("reminderConfig:toasts.added"))
      }
      setIsFormOpen(false)
      setSubmitPayload(null)
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success(t("reminderConfig:toasts.deleted"))
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const configs = configsData?.items || []
  const pagination = configsData?.meta
  const columns: DataTableColumn<ReminderConfig>[] = [
    {
      id: "message_template",
      header: t("reminderConfig:table.messageTemplate"),
      cell: (config) => <span className="font-medium">{config.message_template?.template_name || "-"}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "reminder_offset",
      header: t("reminderConfig:table.offsetMinutes"),
      align: "right",
      cell: (config) => config.reminder_offset,
      widthClassName: "w-36",
    },
    {
      id: "reminder_patient_count",
      header: t("reminderConfig:table.patientCount"),
      align: "right",
      cell: (config) => config.reminder_patient_count,
      widthClassName: "w-36",
    },
    {
      id: "reminder_type",
      header: t("reminderConfig:table.type"),
      cell: (config) =>
        config.reminder_type === "QUEUE"
          ? t("reminderConfig:tabs.queue")
          : config.reminder_type === "SCHEDULE"
            ? t("reminderConfig:tabs.schedule")
            : config.reminder_type,
      widthClassName: "w-36",
    },
    {
      id: "actions",
      header: t("reminderConfig:table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (config) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(config)}
            aria-label={t("reminderConfig:table.editAria", { id: config.id })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(config.id)}
            aria-label={t("reminderConfig:table.deleteAria", { id: config.id })}
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
        <h1 className="text-2xl font-bold">{t("reminderConfig:page.title")}</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("reminderConfig:page.addConfig")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={configs}
        rowKey={(config) => config.id}
        loading={isLoading}
        loadingRowCount={5}
        emptyMessage={t("reminderConfig:table.empty")}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? t("reminderConfig:form.editTitle") : t("reminderConfig:form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(requestSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message_template_id">{t("reminderConfig:form.messageTemplate")}</Label>
              <Select
                value={watch("message_template_id")?.toString() || ""}
                onValueChange={(value) => setValue("message_template_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reminderConfig:form.messageTemplatePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.message_template_id && (
                <p className="text-sm text-destructive">{errors.message_template_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_offset">{t("reminderConfig:form.reminderOffset")}</Label>
              <Input
                id="reminder_offset"
                type="number"
                {...register("reminder_offset", { valueAsNumber: true })}
                placeholder={t("reminderConfig:form.reminderOffsetPlaceholder")}
              />
              {errors.reminder_offset && (
                <p className="text-sm text-destructive">{errors.reminder_offset.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_patient_count">{t("reminderConfig:form.patientCount")}</Label>
              <Input
                id="reminder_patient_count"
                type="number"
                {...register("reminder_patient_count", { valueAsNumber: true })}
                placeholder={t("reminderConfig:form.patientCountPlaceholder")}
              />
              {errors.reminder_patient_count && (
                <p className="text-sm text-destructive">{errors.reminder_patient_count.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_type">{t("reminderConfig:form.reminderType")}</Label>
              <Select
                value={watch("reminder_type") || "QUEUE"}
                onValueChange={(value) => setValue("reminder_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reminderConfig:form.reminderTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUEUE">{t("reminderConfig:tabs.queue")}</SelectItem>
                  <SelectItem value="SCHEDULE">{t("reminderConfig:tabs.schedule")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.reminder_type && (
                <p className="text-sm text-destructive">{errors.reminder_type.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
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
                {editingConfig ? t("common:actions.save") : t("reminderConfig:form.add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("reminderConfig:confirmDelete.title")}
        description={t("reminderConfig:confirmDelete.description")}
        entityName={String(deleteId ?? "") || undefined}
        impactItems={[
          t("reminderConfig:confirmDelete.impact1"),
          t("reminderConfig:confirmDelete.impact2"),
        ]}
        recoveryHint={t("reminderConfig:confirmDelete.recoveryHint")}
        variant="destructive"
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
      />

      <ConfirmDialog
        open={submitPayload !== null}
        onOpenChange={(open) => {
          if (!open) setSubmitPayload(null)
        }}
        title={editingConfig ? t("reminderConfig:confirmSubmit.editTitle") : t("reminderConfig:confirmSubmit.addTitle")}
        description={
          editingConfig
            ? t("reminderConfig:confirmSubmit.editDescription")
            : t("reminderConfig:confirmSubmit.addDescription")
        }
        entityName={
          templates.find((template) => template.id === submitPayload?.message_template_id)?.template_name
        }
        impactItems={[
          t("reminderConfig:confirmSubmit.impact1"),
          t("reminderConfig:confirmSubmit.impact2"),
        ]}
        onConfirm={confirmSubmit}
        confirmText={editingConfig ? t("common:actions.save") : t("reminderConfig:form.add")}
      />
    </div>
  )
}
