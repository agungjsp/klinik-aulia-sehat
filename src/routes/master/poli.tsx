import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, RotateCcw, Search } from "lucide-react"
import {
  usePolyList,
  usePolyTrashed,
  usePolyCreate,
  usePolyUpdate,
  usePolyDelete,
  usePolyRestore,
  useDebouncedValue,
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getApiErrorMessage } from "@/lib/api-error"
import { getLocaleByLanguage } from "@/lib/i18n/date-locale"
import type { DataTableColumn, Poly } from "@/types"

export const Route = createFileRoute("/master/poli")({
  component: PoliPage,
})

type PolyForm = {
  name: string
}

function PoliPage() {
  const { t, i18n } = useTranslation(["master", "common"])
  const { dateFnsLocale } = getLocaleByLanguage(i18n.language)
  const polySchema = z.object({
    name: z.string().min(1, t("master:poly.validation.nameRequired")),
  })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [activeTab, setActiveTab] = useState<"active" | "trashed">("active")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPoly, setEditingPoly] = useState<Poly | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [restoreId, setRestoreId] = useState<number | null>(null)

  const { data: polyData, isLoading } = usePolyList(debouncedSearch || undefined)
  const { data: trashedData, isLoading: isLoadingTrashed } = usePolyTrashed()

  const createMutation = usePolyCreate()
  const updateMutation = usePolyUpdate()
  const deleteMutation = usePolyDelete()
  const restoreMutation = usePolyRestore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PolyForm>({
    resolver: zodResolver(polySchema),
  })

  const openCreateForm = () => {
    setEditingPoly(null)
    reset({ name: "" })
    setIsFormOpen(true)
  }

  const openEditForm = (poly: Poly) => {
    setEditingPoly(poly)
    reset({ name: poly.name })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingPoly) {
        await updateMutation.mutateAsync({ id: editingPoly.id, data })
        toast.success(t("master:poly.toasts.updated"))
      } else {
        await createMutation.mutateAsync(data)
        toast.success(t("master:poly.toasts.added"))
      }
      setIsFormOpen(false)
      reset()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success(t("master:poly.toasts.deleted"))
      setDeleteId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      await restoreMutation.mutateAsync(restoreId)
      toast.success(t("master:poly.toasts.restored"))
      setRestoreId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const activePoli = polyData?.data || []
  const trashedPoli = trashedData?.data || []
  const currentPoli = activeTab === "active" ? activePoli : trashedPoli
  const isCurrentLoading = activeTab === "active" ? isLoading : isLoadingTrashed
  const poliToDelete = activePoli.find((poly) => poly.id === deleteId)
  const poliToRestore = trashedPoli.find((poly) => poly.id === restoreId)
  const columns: DataTableColumn<Poly>[] = [
    {
      id: "id",
      header: t("master:poly.table.id"),
      cell: (poly) => <span className="font-mono text-sm">{poly.id}</span>,
      widthClassName: "w-16",
    },
    {
      id: "name",
      header: t("master:poly.table.name"),
      cell: (poly) => <span className="font-medium">{poly.name}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "timestamp",
      header: activeTab === "active" ? t("master:poly.table.created") : t("master:poly.table.deleted"),
      cell: (poly) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(activeTab === "active" ? poly.created_at : poly.deleted_at!), "dd MMM yyyy HH:mm", { locale: dateFnsLocale })}
        </span>
      ),
      widthClassName: "w-48",
    },
    {
      id: "actions",
      header: t("master:poly.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (poly) => (
        <DataTableActions>
          {activeTab === "active" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditForm(poly)}
                aria-label={t("master:poly.table.editAria", { name: poly.name })}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(poly.id)}
                aria-label={t("master:poly.table.deleteAria", { name: poly.name })}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRestoreId(poly.id)}
              aria-label={t("master:poly.table.restoreAria", { name: poly.name })}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </DataTableActions>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("master:poly.page.title")}</h1>
          <p className="text-muted-foreground">{t("master:poly.page.description")}</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("master:poly.page.addPoly")}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("active")}
        >
          {t("master:common.tabs.active")} ({activePoli.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trashed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("trashed")}
        >
          {t("master:common.tabs.trashed")} ({trashedPoli.length})
        </button>
      </div>

      {/* Search (only for active tab) */}
      {activeTab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("master:poly.page.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <DataTable
        columns={columns}
        rows={currentPoli}
        rowKey={(poly) => poly.id}
        loading={isCurrentLoading}
        loadingRowCount={3}
        emptyMessage={activeTab === "active" ? t("master:poly.page.emptyActive") : t("master:poly.page.emptyTrashed")}
        variant="comfortable"
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPoly ? t("master:poly.form.editTitle") : t("master:poly.form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("master:poly.form.polyName")}</Label>
              <Input
                id="name"
                placeholder={t("master:poly.form.polyNamePlaceholder")}
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
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
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingPoly ? t("master:poly.form.submitUpdate") : t("common:actions.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("master:poly.confirmDelete.title")}
        description={t("master:poly.confirmDelete.description")}
        entityName={poliToDelete?.name}
        impactItems={[
          t("master:poly.confirmDelete.impact1"),
          t("master:poly.confirmDelete.impact2"),
        ]}
        recoveryHint={t("master:poly.confirmDelete.recoveryHint")}
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
        variant="destructive"
      />

      {/* Restore Confirmation */}
      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => !open && setRestoreId(null)}
        title={t("master:poly.confirmRestore.title")}
        description={t("master:poly.confirmRestore.description")}
        entityName={poliToRestore?.name}
        impactItems={[t("master:poly.confirmRestore.impact1")]}
        onConfirm={handleRestore}
        confirmText={t("master:poly.confirmRestore.confirmText")}
      />
    </div>
  )
}
