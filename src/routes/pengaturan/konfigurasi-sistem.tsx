import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useConfigList,
  useConfigCreate,
  useConfigUpdate,
  useConfigDelete,
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
import type { Config, DataTableColumn } from "@/types"

export const Route = createFileRoute("/pengaturan/konfigurasi-sistem")({
  component: ConfigPage,
})

type ConfigForm = {
  name: string
  value: string
}

function ConfigPage() {
  const { t } = useTranslation(["common", "settings"])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [submitPayload, setSubmitPayload] = useState<ConfigForm | null>(null)

  const { data: configsData, isLoading } = useConfigList()

  const createMutation = useConfigCreate()
  const updateMutation = useConfigUpdate()
  const deleteMutation = useConfigDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, t("settings:systemConfig.validation.nameRequired")),
        value: z.string().min(1, t("settings:systemConfig.validation.valueRequired")),
      }),
    ),
    defaultValues: {
      name: "",
      value: "",
    },
  })

  const openCreateForm = () => {
    setEditingConfig(null)
    reset({
      name: "",
      value: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (config: Config) => {
    setEditingConfig(config)
    reset({
      name: config.name,
      value: config.value,
    })
    setIsFormOpen(true)
  }

  const requestSubmit = (formData: ConfigForm) => {
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
        toast.success(t("settings:systemConfig.toasts.updated"))
      } else {
        await createMutation.mutateAsync(submitPayload)
        toast.success(t("settings:systemConfig.toasts.added"))
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
      toast.success(t("settings:systemConfig.toasts.deleted"))
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const configs = configsData?.data || []
  const columns: DataTableColumn<Config>[] = [
    {
      id: "name",
      header: t("settings:systemConfig.table.name"),
      cell: (config) => <span className="font-medium">{config.name}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "value",
      header: t("settings:systemConfig.table.value"),
      cell: (config) => config.value,
      widthClassName: "min-w-[280px]",
      cellClassName: "min-w-0 max-w-md truncate",
    },
    {
      id: "actions",
      header: t("settings:systemConfig.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (config) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(config)}
            aria-label={t("settings:systemConfig.table.editAria", { name: config.name })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(config.id)}
            aria-label={t("settings:systemConfig.table.deleteAria", { name: config.name })}
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
        <h1 className="text-2xl font-bold">{t("settings:systemConfig.page.title")}</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("settings:systemConfig.page.addConfig")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={configs}
        rowKey={(config) => config.id}
        loading={isLoading}
        loadingRowCount={5}
        emptyMessage={t("settings:systemConfig.table.empty")}
        variant="comfortable"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? t("settings:systemConfig.form.editTitle") : t("settings:systemConfig.form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(requestSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settings:systemConfig.form.name")}</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("settings:systemConfig.form.namePlaceholder")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">{t("settings:systemConfig.form.value")}</Label>
              <Input
                id="value"
                {...register("value")}
                placeholder={t("settings:systemConfig.form.valuePlaceholder")}
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
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
        title={t("settings:systemConfig.confirmDelete.title")}
        description={t("settings:systemConfig.confirmDelete.description")}
        entityName={configs.find((config) => config.id === deleteId)?.name}
        impactItems={[
          t("settings:systemConfig.confirmDelete.impact1"),
          t("settings:systemConfig.confirmDelete.impact2"),
        ]}
        recoveryHint={t("settings:systemConfig.confirmDelete.recoveryHint")}
        variant="destructive"
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
      />

      <ConfirmDialog
        open={submitPayload !== null}
        onOpenChange={(open) => {
          if (!open) setSubmitPayload(null)
        }}
        title={editingConfig ? t("settings:systemConfig.confirmSubmit.editTitle") : t("settings:systemConfig.confirmSubmit.addTitle")}
        description={editingConfig ? t("settings:systemConfig.confirmSubmit.editDescription") : t("settings:systemConfig.confirmSubmit.addDescription")}
        entityName={submitPayload?.name}
        impactItems={[
          t("settings:systemConfig.confirmSubmit.impact1"),
          t("settings:systemConfig.confirmSubmit.impact2"),
        ]}
        onConfirm={confirmSubmit}
        confirmText={editingConfig ? t("common:actions.save") : t("common:actions.add")}
      />
    </div>
  )
}
