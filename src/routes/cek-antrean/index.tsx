import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { queueService } from "@/services"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"

export const Route = createFileRoute("/cek-antrean/")({
  component: CekAntreanPage,
})

function CekAntreanPage() {
  const [searchCode, setSearchCode] = useState("")
  const [submittedCode, setSubmittedCode] = useState("")

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["queue-check", submittedCode],
    queryFn: () => queueService.checkQueue(submittedCode),
    enabled: !!submittedCode,
  })

  const queue = data?.data
  const queuePosition = data?.position

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCode.trim()) setSubmittedCode(searchCode.trim().toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Klinik Aulia Sehat</h1>
          <p className="text-blue-600">Cek Status Antrean Anda</p>
          <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan kode antrean (contoh: A001)"
              className="pl-9 h-11"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value.toUpperCase())}
            />
          </div>
          <Button type="submit" className="h-11">Cek</Button>
        </form>

        {isLoading && (
          <div className="rounded-xl bg-white p-6 shadow-lg space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {submittedCode && !isLoading && !queue && (
          <div className="rounded-xl bg-white p-6 shadow-lg text-center">
            <p className="text-lg text-muted-foreground">Antrean tidak ditemukan</p>
            <p className="text-sm text-muted-foreground mt-1">Pastikan kode antrean benar</p>
          </div>
        )}

        {queue && (
          <div className="rounded-xl bg-white p-6 shadow-lg space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Nomor Antrean Anda</p>
              <p className="text-6xl font-bold text-blue-600 my-2">{queue.queue_number}</p>
              <Badge className={`${QUEUE_STATUS_CONFIG[queue.status].bgColor} ${QUEUE_STATUS_CONFIG[queue.status].color}`}>
                {QUEUE_STATUS_CONFIG[queue.status].label}
              </Badge>
            </div>

            {queuePosition !== undefined && queuePosition > 0 && queue.status !== "DONE" && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Posisi dalam antrean</p>
                <p className="text-4xl font-bold text-blue-700">{queuePosition}</p>
                <p className="text-xs text-muted-foreground mt-1">orang di depan Anda</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span className="font-medium">{queue.patient.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Poli</span><span className="font-medium">{queue.poly.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dokter</span><span className="font-medium">{queue.doctor.name}</span></div>
              {queue.check_in_time && <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span className="font-medium">{queue.check_in_time.slice(0, 5)}</span></div>}
            </div>

            <Button variant="outline" className="w-full" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh Status
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
