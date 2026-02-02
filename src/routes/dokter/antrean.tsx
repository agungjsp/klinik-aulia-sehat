import { useState, useEffect, useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { Play, CheckCircle, CalendarPlus } from "lucide-react"
import {
  useReservationList,
  useReservationToWithDoctor,
  useReservationToDone,
  useStatusList,
  usePolyList,
  useRealtimeQueue,
  useCheckupScheduleCreate,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AntreanHeader } from "@/components/antrean"
import { useAuthStore } from "@/stores/auth"
import { getApiErrorMessage } from "@/lib/api-error"
import { sortPoliesWithUmumFirst, getDefaultPolyId } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Reservation, QueueStatusName } from "@/types"

const antreanSearchSchema = z.object({
  polyId: z.number().optional(),
  date: z.string().optional(),
})

// Schema for follow-up schedule form
const followUpSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  description: z.string().optional(),
})

type FollowUpForm = z.infer<typeof followUpSchema>

export const Route = createFileRoute("/dokter/antrean")({
  component: DokterAntreanPage,
  validateSearch: antreanSearchSchema,
})

function DokterAntreanPage() {
  const navigate = useNavigate({ from: "/dokter/antrean" })
  const search = Route.useSearch() ?? {}
  const { user } = useAuthStore()
  const today = format(new Date(), "yyyy-MM-dd")

  // Get selected poly/date from search params or defaults
  const selectedPolyId = search.polyId ?? (user?.poly_id ?? null)
  const selectedDate = search.date ?? today

  // Fetch reservations for selected date
  const { data: reservationData, isLoading, refetch } = useReservationList({ date: selectedDate })
  const { data: statusData } = useStatusList()
  const { data: polyData } = usePolyList()

  // Realtime updates for selected poly
  useRealtimeQueue({
    polyId: selectedPolyId ?? 0,
    polies: polyData?.data,
    enabled: selectedPolyId !== null,
  })

  const toWithDoctorMutation = useReservationToWithDoctor()
  const toDoneMutation = useReservationToDone()
  const checkupScheduleCreateMutation = useCheckupScheduleCreate()

  // Follow-up schedule dialog state
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null)
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)

  const {
    register: registerFollowUp,
    handleSubmit: handleFollowUpSubmit,
    reset: resetFollowUp,
    formState: { errors: followUpErrors },
  } = useForm<FollowUpForm>({
    resolver: zodResolver(followUpSchema),
  })

  // Set default poly if not set and we have polies
  const polies = useMemo(
    () => sortPoliesWithUmumFirst(polyData?.data ?? []),
    [polyData?.data]
  )
  useEffect(() => {
    if (!selectedPolyId && polies.length > 0 && !search.polyId) {
      const defaultPolyId = getDefaultPolyId(polies, user?.poly_id)
      if (defaultPolyId) {
        navigate({
          search: (prev) => ({ ...prev, polyId: defaultPolyId }),
          replace: true,
        })
      }
    }
  }, [selectedPolyId, polies, user?.poly_id, navigate, search.polyId])

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    reservation: Reservation
    action: "withdoctor" | "done"
    title: string
    description: string
  } | null>(null)

  const allReservations = reservationData?.data?.data || []
  const statuses = statusData?.data || []

  // Filter reservations by selected poly
  const reservations = selectedPolyId
    ? allReservations.filter((r) => r.poly_id === selectedPolyId)
    : allReservations

  // Get status id by name
  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const withDoctorId = getStatusId("WITH_DOCTOR")

  // Filter only relevant queues for dokter
  const waitingDoctor = reservations.filter((r) => r.status_id === waitingDoctorId)
  const inConsultation = reservations.filter((r) => r.status_id === withDoctorId)

  // Handle poly change from header
  const handlePolyChange = (polyId: number | null) => {
    navigate({
      search: (prev) => ({ ...prev, polyId: polyId ?? undefined }),
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleAction = (
    reservation: Reservation,
    action: "withdoctor" | "done",
    title: string,
    description: string
  ) => {
    setPendingAction({ reservation, action, title, description })
    setConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    const reservationId = pendingAction.reservation.id
    if (!reservationId) {
      toast.error("Data reservasi tidak tersedia.")
      return
    }

    try {
      if (pendingAction.action === "withdoctor") {
        const result = await toWithDoctorMutation.mutateAsync(reservationId)
        if (result.autoNoShow) {
          toast.warning("Pasien tidak hadir setelah 3x panggilan, status diubah menjadi NO SHOW")
        } else {
          toast.success("Pasien dipanggil untuk konsultasi")
        }
        setConfirmOpen(false)
        setPendingAction(null)
      } else {
        await toDoneMutation.mutateAsync(reservationId)
        toast.success("Konsultasi selesai")
        setConfirmOpen(false)
        // Show follow-up dialog after consultation is done
        setCompletedReservation(pendingAction.reservation)
        setFollowUpDialogOpen(true)
        setPendingAction(null)
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  // Handle closing follow-up dialog (no follow-up needed)
  const handleCloseFollowUpDialog = () => {
    setFollowUpDialogOpen(false)
    setCompletedReservation(null)
    setShowFollowUpForm(false)
    resetFollowUp()
  }

  // Handle showing the follow-up form
  const handleShowFollowUpForm = () => {
    setShowFollowUpForm(true)
    resetFollowUp({ date: "", description: "" })
  }

  // Handle submitting follow-up schedule
  const onFollowUpSubmit = handleFollowUpSubmit(async (data) => {
    if (!completedReservation?.patient_id || !completedReservation?.poly_id) {
      toast.error("Data pasien tidak tersedia")
      return
    }

    try {
      await checkupScheduleCreateMutation.mutateAsync({
        patient_id: completedReservation.patient_id,
        poly_id: completedReservation.poly_id,
        date: data.date,
        description: data.description || "",
      })
      toast.success("Jadwal kontrol berhasil ditambahkan")
      handleCloseFollowUpDialog()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  })

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  const isPending = toWithDoctorMutation.isPending || toDoneMutation.isPending

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <AntreanHeader
        title="Antrean Pasien"
        date={selectedDate}
        selectedPolyId={selectedPolyId}
        reservations={allReservations}
        onPolyChange={handlePolyChange}
        onRefresh={handleRefresh}
        showPolySelector={true}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang Konsultasi */}
        <div className="rounded-lg border">
          <div className="border-b bg-yellow-50 p-4">
            <h2 className="font-semibold text-yellow-700">Sedang Konsultasi</h2>
            <p className="text-sm text-yellow-600">{inConsultation.length} pasien</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : inConsultation.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien</p>
            ) : (
              inConsultation.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border bg-yellow-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-yellow-700">
                        {reservation.queue?.queue_number
                          ? formatQueueNumber(reservation.queue.queue_number)
                          : "-"}
                      </p>
                      <p className="font-medium">{reservation.patient?.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.poly?.name} • {reservation.bpjs ? "BPJS" : "Umum"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "done",
                          "Selesai Konsultasi",
                          `Selesaikan konsultasi untuk pasien ${reservation.patient?.patient_name}?`
                        )
                      }
                      disabled={isPending}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Selesai
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menunggu Konsultasi */}
        <div className="rounded-lg border">
          <div className="border-b bg-purple-50 p-4">
            <h2 className="font-semibold text-purple-700">Menunggu Konsultasi</h2>
            <p className="text-sm text-purple-600">{waitingDoctor.length} pasien</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien menunggu</p>
            ) : (
              waitingDoctor.map((reservation, idx) => (
                <div
                  key={reservation.id}
                  className={`rounded-lg border p-3 flex items-center justify-between ${
                    idx === 0 ? "bg-purple-50 border-purple-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">
                      {reservation.queue?.queue_number
                        ? formatQueueNumber(reservation.queue.queue_number)
                        : "-"}
                    </span>
                    <div>
                      <p className="font-medium">{reservation.patient?.patient_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Selesai anamnesa: {reservation.queue?.call_time?.slice(0, 5) || "-"}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && inConsultation.length === 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "withdoctor",
                          "Panggil Pasien",
                          `Panggil pasien ${reservation.patient?.patient_name} ke ruang konsultasi?`
                        )
                      }
                      disabled={isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Panggil
                    </Button>
                  )}
                  {idx === 0 && inConsultation.length > 0 && (
                    <Badge variant="secondary">Tunggu pasien selesai</Badge>
                  )}
                  {idx > 0 && <Badge variant="outline">Antrean ke-{idx + 1}</Badge>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction?.title || ""}
        description={pendingAction?.description || ""}
        onConfirm={confirmAction}
      />

      {/* Follow-up Schedule Dialog */}
      <Dialog open={followUpDialogOpen} onOpenChange={handleCloseFollowUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Jadwal Kontrol
            </DialogTitle>
            <DialogDescription>
              Apakah pasien <span className="font-semibold">{completedReservation?.patient?.patient_name}</span> perlu dijadwalkan untuk kontrol berikutnya?
            </DialogDescription>
          </DialogHeader>

          {!showFollowUpForm ? (
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button variant="outline" onClick={handleCloseFollowUpDialog}>
                Tidak Perlu
              </Button>
              <Button onClick={handleShowFollowUpForm}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Ya, Jadwalkan
              </Button>
            </DialogFooter>
          ) : (
            <form onSubmit={onFollowUpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Pasien</Label>
                <Input 
                  value={completedReservation?.patient?.patient_name || ""} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Poli</Label>
                <Input 
                  value={completedReservation?.poly?.name || ""} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-date">Tanggal Kontrol</Label>
                <Input 
                  id="follow-up-date"
                  type="date" 
                  min={format(new Date(), "yyyy-MM-dd")}
                  {...registerFollowUp("date")} 
                />
                {followUpErrors.date && (
                  <p className="text-sm text-destructive">{followUpErrors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-description">Keterangan (opsional)</Label>
                <Textarea 
                  id="follow-up-description"
                  placeholder="Contoh: Kontrol tekanan darah, cek hasil lab, dll."
                  {...registerFollowUp("description")} 
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowFollowUpForm(false)}>
                  Kembali
                </Button>
                <Button type="submit" disabled={checkupScheduleCreateMutation.isPending}>
                  {checkupScheduleCreateMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                  Simpan Jadwal
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
