import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useMessageTemplateList,
  useMessageTemplateCreate,
  useMessageTemplateUpdate,
  useMessageTemplateDelete,
} from "@/hooks/use-message-template"
import { getApiErrorMessage } from "@/lib/api-error"
import type { DataTableColumn, MessageTemplate } from "@/types"

type MessageTemplateForm = {
  template_name: string
  message: string
}

export const Route = createFileRoute("/pengaturan/template-pesan")({
  component: MessageTemplatePage,
})

function MessageTemplatePage() {
  const { t } = useTranslation(["settings", "common"])
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [submitPayload, setSubmitPayload] = useState<MessageTemplateForm | null>(null)

  const { data, isLoading, isFetching } = useMessageTemplateList({
    search: debouncedSearch,
    page,
    per_page: perPage,
  })

  const createMutation = useMessageTemplateCreate()
  const updateMutation = useMessageTemplateUpdate()
  const deleteMutation = useMessageTemplateDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageTemplateForm>({
    resolver: zodResolver(
      z.object({
        template_name: z.string().min(1, t("settings:messageTemplate.validation.nameRequired")),
        message: z.string().min(1, t("settings:messageTemplate.validation.contentRequired")),
      }),
    ),
    defaultValues: {
      template_name: "",
      message: "",
    },
  })

  const openCreateForm = () => {
    setEditingTemplate(null)
    reset({ template_name: "", message: "" })
    setIsFormOpen(true)
  }

  const openEditForm = (template: MessageTemplate) => {
    setEditingTemplate(template)
    reset({ template_name: template.template_name, message: template.message })
    setIsFormOpen(true)
  }

  const requestSubmit = (formData: MessageTemplateForm) => {
    setSubmitPayload(formData)
  }

  const confirmSubmit = async () => {
    if (!submitPayload) return
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          data: submitPayload,
        })
        toast.success(t("settings:messageTemplate.toasts.updated"))
      } else {
        await createMutation.mutateAsync(submitPayload)
        toast.success(t("settings:messageTemplate.toasts.added"))
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
      toast.success(t("settings:messageTemplate.toasts.deleted"))
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const templates = data?.items || []
  const pagination = data?.meta
  const columns: DataTableColumn<MessageTemplate>[] = [
    {
      id: "template_name",
      header: t("settings:messageTemplate.table.name"),
      cell: (template) => <span className="font-medium">{template.template_name}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "message",
      header: t("settings:messageTemplate.table.content"),
      cell: (template) => template.message,
      widthClassName: "min-w-[320px]",
      cellClassName: "min-w-0 max-w-md truncate",
    },
    {
      id: "actions",
      header: t("settings:messageTemplate.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (template) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(template)}
            aria-label={t("settings:messageTemplate.table.editAria", { name: template.template_name })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(template.id)}
            aria-label={t("settings:messageTemplate.table.deleteAria", { name: template.template_name })}
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
        <h1 className="text-2xl font-bold">{t("settings:messageTemplate.page.title")}</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("settings:messageTemplate.page.addTemplate")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("settings:messageTemplate.page.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={templates}
        rowKey={(template) => template.id}
        loading={isLoading}
        loadingRowCount={5}
        emptyMessage={t("settings:messageTemplate.table.empty")}
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
          isPending={isFetching}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t("settings:messageTemplate.form.editTitle") : t("settings:messageTemplate.form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(requestSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settings:messageTemplate.form.name")}</Label>
              <Input
                id="name"
                {...register('template_name')}
                placeholder={t("settings:messageTemplate.form.namePlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("settings:messageTemplate.form.nameHint")}</p>
              {errors.template_name && (
                <p className="text-sm text-destructive">{errors.template_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("settings:messageTemplate.form.content")}</Label>
              <Textarea
                id="content"
                {...register("message")}
                placeholder={t("settings:messageTemplate.form.contentPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("settings:messageTemplate.form.contentHint")}</p>
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
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
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTemplate ? t("common:actions.save") : t("common:actions.add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("settings:messageTemplate.confirmDelete.title")}
        description={t("settings:messageTemplate.confirmDelete.description")}
        entityName={templates.find((template) => template.id === deleteId)?.template_name}
        impactItems={[
          t("settings:messageTemplate.confirmDelete.impact1"),
          t("settings:messageTemplate.confirmDelete.impact2"),
        ]}
        recoveryHint={t("settings:messageTemplate.confirmDelete.recoveryHint")}
        variant="destructive"
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
      />

      <ConfirmDialog
        open={submitPayload !== null}
        onOpenChange={(open) => {
          if (!open) setSubmitPayload(null)
        }}
        title={editingTemplate ? t("settings:messageTemplate.confirmSubmit.editTitle") : t("settings:messageTemplate.confirmSubmit.addTitle")}
        description={editingTemplate ? t("settings:messageTemplate.confirmSubmit.editDescription") : t("settings:messageTemplate.confirmSubmit.addDescription")}
        entityName={submitPayload?.template_name}
        impactItems={[
          t("settings:messageTemplate.confirmSubmit.impact1"),
          t("settings:messageTemplate.confirmSubmit.impact2"),
        ]}
        onConfirm={confirmSubmit}
        confirmText={editingTemplate ? t("common:actions.save") : t("common:actions.add")}
      />
    </div>
  )
}
