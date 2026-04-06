import { useState, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FileText } from "lucide-react"
import {
  useFaqList,
  useFaqCreate,
  useFaqUpdate,
  useFaqDelete,
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
import type { DataTableColumn, Faq } from "@/types"

export const Route = createFileRoute("/pengaturan/faq")({
  component: FaqPage,
})

type FaqForm = {
  name: string
  file?: File
}

function FaqPage() {
  const { t } = useTranslation(["common", "settings"])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: faqsData, isLoading } = useFaqList()

  const createMutation = useFaqCreate()
  const updateMutation = useFaqUpdate()
  const deleteMutation = useFaqDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqForm>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, t("settings:faq.validation.nameRequired")),
        file: z.instanceof(File).optional(),
      }),
    ),
    defaultValues: {
      name: "",
    },
  })

  const openCreateForm = () => {
    setEditingFaq(null)
    setSelectedFile(null)
    reset({ name: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsFormOpen(true)
  }

  const openEditForm = (faq: Faq) => {
    setEditingFaq(faq)
    setSelectedFile(null)
    reset({ name: faq.name })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsFormOpen(true)
  }

  const onSubmit = async (formData: FaqForm) => {
    try {
      if (editingFaq) {
        // Update - file is optional
        await updateMutation.mutateAsync({
          id: editingFaq.id,
          data: {
            name: formData.name,
            file: selectedFile || undefined,
          },
        })
        toast.success(t("settings:faq.toasts.updated"))
      } else {
        // Create - file is required
        if (!selectedFile) {
          toast.error(t("settings:faq.toasts.fileRequired"))
          return
        }
        await createMutation.mutateAsync({
          name: formData.name,
          file: selectedFile,
        })
        toast.success(t("settings:faq.toasts.added"))
      }
      setIsFormOpen(false)
      setSelectedFile(null)
      reset()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success(t("settings:faq.toasts.deleted"))
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const faqs = faqsData?.data || []
  const columns: DataTableColumn<Faq>[] = [
    {
      id: "name",
      header: t("settings:faq.table.name"),
      cell: (faq) => <span className="font-medium">{faq.name}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "file",
      header: t("settings:faq.table.file"),
      widthClassName: "min-w-[200px]",
      cell: (faq) => (
        faq.file ? (
          <a
            href={faq.file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            {t("settings:faq.table.viewFile")}
          </a>
        ) : (
          "-"
        )
      ),
    },
    {
      id: "actions",
      header: t("settings:faq.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (faq) => (
        <DataTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditForm(faq)}
            aria-label={t("settings:faq.table.editAria", { name: faq.name })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(faq.id)}
            aria-label={t("settings:faq.table.deleteAria", { name: faq.name })}
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
        <h1 className="text-2xl font-bold">{t("settings:faq.page.title")}</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("settings:faq.page.addFaq")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={faqs}
        rowKey={(faq) => faq.id}
        loading={isLoading}
        loadingRowCount={5}
        emptyMessage={t("settings:faq.table.empty")}
        variant="comfortable"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? t("settings:faq.form.editTitle") : t("settings:faq.form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settings:faq.form.name")}</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("settings:faq.form.namePlaceholder")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">
                {t("settings:faq.form.fileLabel")} {!editingFaq && t("settings:faq.form.fileRequiredTag")}
              </Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {t("settings:faq.form.selectedFile", { name: selectedFile.name })}
                </p>
              )}
              {editingFaq && !selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {t("settings:faq.form.editFileHint")}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false)
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                {t("common:actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingFaq ? t("common:actions.save") : t("common:actions.add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title={t("settings:faq.confirmDelete.title")}
        description={t("settings:faq.confirmDelete.description")}
        entityName={faqs.find((faq) => faq.id === deleteId)?.name}
        impactItems={[
          t("settings:faq.confirmDelete.impact1"),
          t("settings:faq.confirmDelete.impact2"),
        ]}
        recoveryHint={t("settings:faq.confirmDelete.recoveryHint")}
        variant="destructive"
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
      />
    </div>
  )
}
