import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useWhatsappConfigList,
  useWhatsappConfigCreate,
  useWhatsappConfigUpdate,
  useWhatsappConfigDelete,
} from "@/hooks"
import { DataTable, DataTableActions } from "@/components/data-table"
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
import { getApiErrorMessage } from "@/lib/api-error"
import type { DataTableColumn, WhatsappConfig } from "@/types"

export const Route = createFileRoute("/pengaturan/konfigurasi-whatsapp")({
  component: WhatsappConfigPage,
})

type WhatsappConfigForm = {
  whatsapp_number: string
  waha_api_url: string
}

function WhatsappConfigPage() {
  const { t } = useTranslation(["settings", "common"])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<WhatsappConfig | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [submitPayload, setSubmitPayload] = useState<WhatsappConfigForm | null>(null)

  const { data: configsData, isLoading } = useWhatsappConfigList()

  const createMutation = useWhatsappConfigCreate()
  const updateMutation = useWhatsappConfigUpdate()
  const deleteMutation = useWhatsappConfigDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsappConfigForm>({
    resolver: zodResolver(
      z.object({
        whatsapp_number: z.string().min(1, t("settings:whatsappConfig.validation.whatsappRequired")),
        waha_api_url: z
          .string()
          .min(1, t("settings:whatsappConfig.validation.apiUrlRequired"))
          .url(t("settings:whatsappConfig.validation.apiUrlInvalid")),
      }),
    ),
    defaultValues: {
      whatsapp_number: "",
      waha_api_url: "",
    },
  })

  const openCreateForm = () => {
    setEditingConfig(null)
    reset({
      whatsapp_number: "",
      waha_api_url: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (config: WhatsappConfig) => {
    setEditingConfig(config)
    reset({
      whatsapp_number: config.whatsapp_number,
      waha_api_url: config.waha_api_url,
    })
    setIsFormOpen(true)
  }

  const requestSubmit = (formData: WhatsappConfigForm) => {
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
        toast.success(t("settings:whatsappConfig.toasts.updated"))
      } else {
        await createMutation.mutateAsync(submitPayload)
        toast.success(t("settings:whatsappConfig.toasts.added"))
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
      toast.success(t("settings:whatsappConfig.toasts.deleted"))
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const configs = configsData?.data || []
  const columns: DataTableColumn<WhatsappConfig>[] = [
    {
      id: "whatsapp_number",
      header: t("settings:whatsappConfig.table.whatsappNumber"),
      cell: (config) => <span className="font-medium">{config.whatsapp_number}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "waha_api_url",
      header: t("settings:whatsappConfig.table.apiUrl"),
      cell: (config) => config.waha_api_url,
      widthClassName: "min-w-[320px]",
      cellClassName: "min-w-0 max-w-md truncate",
    },
    {
      id: "actions",
      header: t("settings:whatsappConfig.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (config) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(config)}
            aria-label={t("settings:whatsappConfig.table.editAria", { value: config.whatsapp_number })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(config.id)}
            aria-label={t("settings:whatsappConfig.table.deleteAria", { value: config.whatsapp_number })}
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
        <h1 className="text-2xl font-bold">{t("settings:whatsappConfig.page.title")}</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("settings:whatsappConfig.page.addConfig")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={configs}
        rowKey={(config) => config.id}
        loading={isLoading}
        loadingRowCount={5}
        emptyMessage={t("settings:whatsappConfig.table.empty")}
        variant="comfortable"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? t("settings:whatsappConfig.form.editTitle") : t("settings:whatsappConfig.form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(requestSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">{t("settings:whatsappConfig.form.whatsappNumber")}</Label>
              <Input
                id="whatsapp_number"
                {...register("whatsapp_number")}
                placeholder={t("settings:whatsappConfig.form.whatsappNumberPlaceholder")}
              />
              {errors.whatsapp_number && (
                <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waha_api_url">{t("settings:whatsappConfig.form.apiUrl")}</Label>
              <Input
                id="waha_api_url"
                {...register("waha_api_url")}
                placeholder={t("settings:whatsappConfig.form.apiUrlPlaceholder")}
              />
              {errors.waha_api_url && (
                <p className="text-sm text-destructive">{errors.waha_api_url.message}</p>
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
                {editingConfig ? t("common:actions.save") : t("common:actions.add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("settings:whatsappConfig.confirmDelete.title")}
        description={t("settings:whatsappConfig.confirmDelete.description")}
        entityName={configs.find((config) => config.id === deleteId)?.whatsapp_number}
        impactItems={[
          t("settings:whatsappConfig.confirmDelete.impact1"),
          t("settings:whatsappConfig.confirmDelete.impact2"),
        ]}
        recoveryHint={t("settings:whatsappConfig.confirmDelete.recoveryHint")}
        variant="destructive"
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
      />

      <ConfirmDialog
        open={submitPayload !== null}
        onOpenChange={(open) => {
          if (!open) setSubmitPayload(null)
        }}
        title={editingConfig ? t("settings:whatsappConfig.confirmSubmit.editTitle") : t("settings:whatsappConfig.confirmSubmit.addTitle")}
        description={editingConfig ? t("settings:whatsappConfig.confirmSubmit.editDescription") : t("settings:whatsappConfig.confirmSubmit.addDescription")}
        entityName={submitPayload?.whatsapp_number}
        impactItems={[
          t("settings:whatsappConfig.confirmSubmit.impact1"),
          t("settings:whatsappConfig.confirmSubmit.impact2"),
        ]}
        onConfirm={confirmSubmit}
        confirmText={editingConfig ? t("common:actions.save") : t("common:actions.add")}
      />
    </div>
  )
}
