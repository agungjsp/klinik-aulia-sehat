import { useState, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FileText } from "lucide-react"
import {
  useFaqList,
  useFaqCreate,
  useFaqUpdate,
  useFaqDelete,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import type { Faq } from "@/types"

export const Route = createFileRoute("/pengaturan/faq")({
  component: FaqPage,
})

const faqSchema = z.object({
  name: z.string().min(1, "Nama FAQ wajib diisi"),
  file: z.instanceof(File).optional(),
})

type FaqForm = z.infer<typeof faqSchema>

function FaqPage() {
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
    resolver: zodResolver(faqSchema),
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
        toast.success("FAQ berhasil diperbarui")
      } else {
        // Create - file is required
        if (!selectedFile) {
          toast.error("File wajib diupload")
          return
        }
        await createMutation.mutateAsync({
          name: formData.name,
          file: selectedFile,
        })
        toast.success("FAQ berhasil ditambahkan")
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
      toast.success("FAQ berhasil dihapus")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah FAQ
        </Button>
      </div>

      <Table variant="comfortable">
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">{faq.name}</TableCell>
                  <TableCell>
                    {faq.file ? (
                      <a
                        href={faq.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Lihat File
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(faq.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
      </Table>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? "Edit FAQ" : "Tambah FAQ"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama FAQ</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Masukkan nama FAQ"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File {!editingFaq && "(Wajib)"}</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  File dipilih: {selectedFile.name}
                </p>
              )}
              {editingFaq && !selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Biarkan kosong untuk mempertahankan file yang ada
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
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingFaq ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Hapus FAQ"
        description="Apakah Anda yakin ingin menghapus FAQ ini?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
