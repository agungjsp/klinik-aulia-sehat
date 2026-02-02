import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  useMessageTemplateList,
  useMessageTemplateCreate,
  useMessageTemplateUpdate,
  useMessageTemplateDelete,
} from '@/hooks/use-message-template';
import { getApiErrorMessage } from '@/lib/api-error';
import type { MessageTemplate } from '@/types';

const messageTemplateSchema = z.object({
  template_name: z.string().min(1, 'Nama template wajib diisi'),
  message: z.string().min(1, 'Konten template wajib diisi'),
});

type MessageTemplateForm = z.infer<typeof messageTemplateSchema>;

export const Route = createFileRoute('/pengaturan/template-pesan')({
  component: MessageTemplatePage,
});

function MessageTemplatePage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useMessageTemplateList({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const createMutation = useMessageTemplateCreate();
  const updateMutation = useMessageTemplateUpdate();
  const deleteMutation = useMessageTemplateDelete();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageTemplateForm>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      template_name: '',
      message: '',
    },
  });

  const openCreateForm = () => {
    setEditingTemplate(null);
    reset({ template_name: '', message: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (template: MessageTemplate) => {
    setEditingTemplate(template);
    reset({ template_name: template.template_name, message: template.message });
    setIsFormOpen(true);
  };

  const onSubmit = async (formData: MessageTemplateForm) => {
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          data: formData,
        });
        toast.success('Template pesan berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Template pesan berhasil ditambahkan');
      }
      setIsFormOpen(false);
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Template pesan berhasil dihapus');
      setDeleteId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const templates = data?.data.data || [];
  const pagination = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Template Pesan</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Template
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Table variant="comfortable">
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Konten</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.template_name}</TableCell>
                  <TableCell className="max-w-md truncate">{template.message}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(template.id)}
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

      {pagination && (
        <PaginationControls
          currentPage={page}
          perPage={perPage}
          totalPages={pagination.last_page}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Tambah Template'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Template</Label>
              <Input
                id="name"
                {...register('template_name')}
                placeholder="Masukkan nama template"
              />
              {errors.template_name && (
                <p className="text-sm text-destructive">{errors.template_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Konten</Label>
              <textarea
                id="content"
                {...register('message')}
                placeholder="Masukkan konten template"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
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
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTemplate ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Hapus Template"
        description="Apakah Anda yakin ingin menghapus template ini?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
