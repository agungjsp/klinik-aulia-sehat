import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { format, subDays } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  Download,
  FileSpreadsheet,
  Users,
  Clock,
  Activity,
  Building,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  UserX,
  XCircle,
  BarChart3,
  Hourglass,
  Calendar,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import {
  usePatientVisitsReport,
  useExportPatientVisits,
  useNoShowCancelledReport,
  useExportNoShowCancelled,
  useBpjsVsGeneralReport,
  useExportBpjsVsGeneral,
  usePolyPerformanceReport,
  useExportPolyPerformance,
  useWaitingTimeReport,
  useExportWaitingTime,
  useBusyHourReport,
  useExportBusyHour,
  useUserActivityReport,
  useExportUserActivity,
  usePolyList,
  useStatusList,
  useUserList,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReportParams, User } from "@/types"

export const Route = createFileRoute("/laporan/")({
  component: LaporanPage,
})

function LaporanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd")

  // Filter states
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)
  const [selectedPolyId, setSelectedPolyId] = useState<number | undefined>(undefined)
  const [insuranceType, setInsuranceType] = useState<"BPJS" | "GENERAL" | undefined>(undefined)
  const [selectedStatusIds, setSelectedStatusIds] = useState<number[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)

  const { data: polyData } = usePolyList()
  const polies = polyData?.data || []
  const { data: statusData } = useStatusList()
  const statuses = statusData?.data || []
  const { data: userData } = useUserList({ per_page: 100 })
  const users = userData?.data || []

  const toggleStatus = (id: number, checked: boolean) => {
    setSelectedStatusIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)))
    setPage(1)
  }

  const reportParams: ReportParams = {
    date_from: dateFrom,
    date_to: dateTo,
    poly_id: selectedPolyId,
    insurance_type: insuranceType,
    status: selectedStatusIds.length > 0 ? selectedStatusIds : undefined,
    user_id: selectedUserId,
    page,
    per_page: perPage,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label htmlFor="date_from">Dari Tanggal</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px] bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date_to">Sampai Tanggal</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px] bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label>Poli</Label>
              <Select
                value={selectedPolyId ? String(selectedPolyId) : "all"}
                onValueChange={(v) => setSelectedPolyId(v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger className="w-[150px] bg-background">
                  <SelectValue placeholder="Semua Poli" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Poli</SelectItem>
                  {polies.map((poly) => (
                    <SelectItem key={poly.id} value={String(poly.id)}>
                      {poly.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Asuransi</Label>
              <Select
                value={insuranceType ?? "all"}
                onValueChange={(v) => setInsuranceType(v === "all" ? undefined : v === "BPJS" ? "BPJS" : "GENERAL")}
              >
                <SelectTrigger className="w-[160px] bg-background">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="BPJS">BPJS</SelectItem>
                  <SelectItem value="GENERAL">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between bg-background">
                    {selectedStatusIds.length > 0 ? `${selectedStatusIds.length} dipilih` : "Semua"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  {statuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status.id}
                      checked={selectedStatusIds.includes(status.id)}
                      onCheckedChange={(checked) => toggleStatus(status.id, Boolean(checked))}
                    >
                      {status.label ?? status.status_name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-1">
              <Label>User</Label>
              <Select
                value={selectedUserId ? String(selectedUserId) : "all"}
                onValueChange={(v) => setSelectedUserId(v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Semua User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua User</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Page</Label>
              <Input
                type="number"
                value={page}
                min={1}
                onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
                className="w-[100px] bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label>Per Page</Label>
              <Input
                type="number"
                value={perPage}
                min={1}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value) || 1)
                  setPerPage(value)
                  setPage(1)
                }}
                className="w-[120px] bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="patient-visits" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-2 bg-muted/50 p-2">
          <TabsTrigger value="patient-visits" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            Kunjungan Pasien
          </TabsTrigger>
          <TabsTrigger value="no-show" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <UserX className="h-4 w-4" />
            No Show & Batal
          </TabsTrigger>
          <TabsTrigger value="bpjs" className="gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <FileSpreadsheet className="h-4 w-4" />
            BPJS vs Umum
          </TabsTrigger>
          <TabsTrigger value="poly-performance" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building className="h-4 w-4" />
            Kinerja Poli
          </TabsTrigger>
          <TabsTrigger value="waiting-time" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Clock className="h-4 w-4" />
            Waktu Tunggu
          </TabsTrigger>
          <TabsTrigger value="busy-hour" className="gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4" />
            Jam Sibuk
          </TabsTrigger>
          <TabsTrigger value="user-activity" className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            Aktivitas User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient-visits">
          <PatientVisitsReportSection params={reportParams} />
        </TabsContent>

        <TabsContent value="no-show">
          <NoShowReportSection params={reportParams} />
        </TabsContent>

        <TabsContent value="bpjs">
          <BpjsReportSection params={reportParams} />
        </TabsContent>

        <TabsContent value="poly-performance">
          <PolyPerformanceReportSection params={reportParams} />
        </TabsContent>

        <TabsContent value="waiting-time">
          <WaitingTimeReportSection params={reportParams} />
        </TabsContent>

        <TabsContent value="busy-hour">
          <BusyHourReportSection params={reportParams} />
        </TabsContent>

        <TabsContent value="user-activity">
          <UserActivityReportSection params={reportParams} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// Shared Components & Helpers
// ============================================

/**
 * Format waiting time in minutes to a readable string
 * - Averages: 1 decimal place
 * - Max/Min: Rounded to nearest integer
 */
function formatWaitingTime(minutes: number | null | undefined, isAverage = false): string {
  if (minutes === null || minutes === undefined) return "-"
  if (isAverage) {
    return `${Math.round(minutes * 10) / 10} menit`
  }
  return `${Math.round(minutes)} menit`
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "blue" | "green" | "orange" | "purple" | "amber" | "red"
}

function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }: KPICardProps) {
  const colorStyles = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  }

  const iconStyles = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  }

  return (
    <Card className={cn("border p-0 gap-0", colorStyles[color])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
          </div>
          <div className={cn("p-2 rounded-lg", iconStyles[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && trendValue && (
          <div className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            trend === "up" && "text-green-600",
            trend === "down" && "text-red-600",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
    </div>
  )
}

// ============================================
// Report Sections
// ============================================

function PatientVisitsReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = usePatientVisitsReport(params)
  const exportMutation = useExportPatientVisits()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const total = data.data.length
    const completed = data.data.filter((d) => d.status === "DONE" || d.status === "Selesai").length
    const bpjs = data.data.filter((d) => d.insurance_type === "BPJS").length
    const avgWait = data.data.filter((d) => d.waiting_time_minutes).reduce((sum, d) => sum + (d.waiting_time_minutes || 0), 0) / (data.data.filter((d) => d.waiting_time_minutes).length || 1)
    return { total, completed, bpjs, avgWait: Math.round(avgWait) }
  }, [data])

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Kunjungan"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Selesai Dilayani"
            value={stats.completed}
            subtitle={`${((stats.completed / stats.total) * 100).toFixed(0)}% dari total`}
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title="Pasien BPJS"
            value={stats.bpjs}
            subtitle={`${((stats.bpjs / stats.total) * 100).toFixed(0)}% dari total`}
            icon={FileSpreadsheet}
            color="purple"
          />
          <KPICard
            title="Rata-rata Tunggu"
            value={`${stats.avgWait} menit`}
            icon={Clock}
            color="amber"
          />
        </div>
      )}

      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-blue-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Laporan Kunjungan Pasien
              </CardTitle>
              <CardDescription>Daftar kunjungan pasien berdasarkan filter</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tidak ada data kunjungan"
              description="Coba perluas rentang tanggal atau ubah filter poli untuk melihat data kunjungan pasien."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu Tunggu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell>{item.patient_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.poly}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.insurance_type === "BPJS" ? "default" : "secondary"}>
                          {item.insurance_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "DONE" || item.status === "Selesai" ? "default" : "outline"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatWaitingTime(item.waiting_time_minutes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NoShowReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = useNoShowCancelledReport(params)
  const exportMutation = useExportNoShowCancelled()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const totalReservations = data.data.reduce((sum, d) => sum + d.total_reservations, 0)
    const totalNoShow = data.data.reduce((sum, d) => sum + d.no_show, 0)
    const totalCancelled = data.data.reduce((sum, d) => sum + d.cancelled, 0)
    const avgRatio = totalReservations > 0 ? ((totalNoShow + totalCancelled) / totalReservations) * 100 : 0
    return { totalReservations, totalNoShow, totalCancelled, avgRatio }
  }, [data])

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Reservasi"
            value={stats.totalReservations}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Tidak Hadir"
            value={stats.totalNoShow}
            subtitle={`${stats.totalReservations > 0 ? ((stats.totalNoShow / stats.totalReservations) * 100).toFixed(1) : 0}%`}
            icon={UserX}
            color="orange"
          />
          <KPICard
            title="Dibatalkan"
            value={stats.totalCancelled}
            subtitle={`${stats.totalReservations > 0 ? ((stats.totalCancelled / stats.totalReservations) * 100).toFixed(1) : 0}%`}
            icon={XCircle}
            color="red"
          />
          <KPICard
            title="Rasio Gagal"
            value={`${stats.avgRatio.toFixed(1)}%`}
            subtitle="No show + Batal"
            icon={AlertCircle}
            color="amber"
          />
        </div>
      )}

      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-orange-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-600" />
                Laporan No Show & Pembatalan
              </CardTitle>
              <CardDescription>Statistik pasien tidak hadir dan pembatalan</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={UserX}
              title="Tidak ada data no-show"
              description="Tidak ada pasien yang tidak hadir atau membatalkan reservasi pada periode ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead className="text-right">Total Reservasi</TableHead>
                    <TableHead className="text-right">No Show</TableHead>
                    <TableHead className="text-right">Dibatalkan</TableHead>
                    <TableHead className="text-right">Rasio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.poly}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.total_reservations}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.no_show > 0 ? "text-orange-600 font-medium" : ""}>
                          {item.no_show}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.cancelled > 0 ? "text-red-600 font-medium" : ""}>
                          {item.cancelled}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.ratio_percent > 10 ? "destructive" : "secondary"}>
                          {item.ratio_percent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BpjsReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = useBpjsVsGeneralReport(params)
  const exportMutation = useExportBpjsVsGeneral()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const totalBpjs = data.data.reduce((sum, d) => sum + d.total_bpjs, 0)
    const totalGeneral = data.data.reduce((sum, d) => sum + d.total_general, 0)
    const total = totalBpjs + totalGeneral
    return { totalBpjs, totalGeneral, total }
  }, [data])

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Pasien"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Pasien BPJS"
            value={stats.totalBpjs}
            subtitle={`${((stats.totalBpjs / stats.total) * 100).toFixed(0)}% dari total`}
            icon={FileSpreadsheet}
            color="green"
          />
          <KPICard
            title="Pasien Umum"
            value={stats.totalGeneral}
            subtitle={`${((stats.totalGeneral / stats.total) * 100).toFixed(0)}% dari total`}
            icon={Users}
            color="purple"
          />
          <KPICard
            title="Rasio BPJS:Umum"
            value={stats.totalGeneral > 0 ? `${(stats.totalBpjs / stats.totalGeneral).toFixed(1)}:1` : "N/A"}
            icon={BarChart3}
            color="amber"
          />
        </div>
      )}

      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-green-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Laporan BPJS vs Umum
              </CardTitle>
              <CardDescription>Perbandingan jumlah pasien BPJS dan Umum</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="Tidak ada data perbandingan"
              description="Coba perluas rentang tanggal untuk melihat perbandingan pasien BPJS vs Umum."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead className="text-right">BPJS</TableHead>
                    <TableHead className="text-right">Umum</TableHead>
                    <TableHead className="text-right">% BPJS</TableHead>
                    <TableHead className="text-right">% Umum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.poly}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">{item.total_bpjs}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-purple-600 font-medium">{item.total_general}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default" className="bg-green-600">
                          {item.bpjs_percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {item.general_percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PolyPerformanceReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = usePolyPerformanceReport(params)
  const exportMutation = useExportPolyPerformance()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const totalPatients = data.data.reduce((sum, d) => sum + d.total_patients, 0)
    const avgWait = data.data.filter((d) => d.average_waiting_time_minutes).reduce((sum, d) => sum + (d.average_waiting_time_minutes || 0), 0) / (data.data.filter((d) => d.average_waiting_time_minutes).length || 1)
    const avgNoShow = data.data.reduce((sum, d) => sum + d.no_show_rate_percent, 0) / data.data.length
    const topPoly = data.data.reduce((max, d) => d.total_patients > max.total_patients ? d : max, data.data[0])
    return { totalPatients, avgWait: Math.round(avgWait), avgNoShow, topPoly }
  }, [data])

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Pasien"
            value={stats.totalPatients}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Rata-rata Tunggu"
            value={`${stats.avgWait} menit`}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Rata-rata No Show"
            value={`${stats.avgNoShow.toFixed(1)}%`}
            icon={UserX}
            color="orange"
          />
          <KPICard
            title="Poli Tersibuk"
            value={stats.topPoly.poly}
            subtitle={`${stats.topPoly.total_patients} pasien`}
            icon={Building}
            color="green"
          />
        </div>
      )}

      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-blue-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Laporan Kinerja Poli
              </CardTitle>
              <CardDescription>Statistik performa per poli</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Building}
              title="Tidak ada data kinerja poli"
              description="Coba perluas rentang tanggal untuk melihat statistik performa poli."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead className="text-right">Total Pasien</TableHead>
                    <TableHead className="text-right">Waktu Tunggu</TableHead>
                    <TableHead className="text-right">No Show Rate</TableHead>
                    <TableHead>Jam Sibuk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.poly}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.total_patients}</TableCell>
                      <TableCell className="text-right">
                        {formatWaitingTime(item.average_waiting_time_minutes, true)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.no_show_rate_percent > 10 ? "destructive" : "secondary"}>
                          {item.no_show_rate_percent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {item.peak_hour}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WaitingTimeReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = useWaitingTimeReport(params)
  const exportMutation = useExportWaitingTime()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const avgWait = data.data.filter((d) => d.average_waiting_time_minutes).reduce((sum, d) => sum + (d.average_waiting_time_minutes || 0), 0) / (data.data.filter((d) => d.average_waiting_time_minutes).length || 1)
    const maxWait = Math.max(...data.data.map((d) => d.longest_waiting_time_minutes || 0))
    const minWait = Math.min(...data.data.filter((d) => d.fastest_waiting_time_minutes).map((d) => d.fastest_waiting_time_minutes || 999))
    const bestPoly = data.data.reduce((min, d) => (d.average_waiting_time_minutes || 999) < (min.average_waiting_time_minutes || 999) ? d : min, data.data[0])
    return { 
      avgWait: Math.round(avgWait * 10) / 10, // 1 decimal place
      maxWait: Math.round(maxWait), 
      minWait: minWait === 999 ? 0 : Math.round(minWait), 
      bestPoly 
    }
  }, [data])

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Rata-rata Tunggu"
            value={`${stats.avgWait} menit`}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Waktu Terlama"
            value={`${stats.maxWait} menit`}
            icon={Hourglass}
            color="red"
          />
          <KPICard
            title="Waktu Tercepat"
            value={`${stats.minWait} menit`}
            icon={TrendingDown}
            color="green"
          />
          <KPICard
            title="Poli Tercepat"
            value={stats.bestPoly.poly}
            subtitle={formatWaitingTime(stats.bestPoly.average_waiting_time_minutes, true)}
            icon={Building}
            color="blue"
          />
        </div>
      )}

      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-purple-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Laporan Waktu Tunggu
              </CardTitle>
              <CardDescription>Statistik waktu tunggu per poli</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Tidak ada data waktu tunggu"
              description="Coba perluas rentang tanggal untuk melihat statistik waktu tunggu."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead className="text-right">Rata-rata</TableHead>
                    <TableHead className="text-right">Terlama</TableHead>
                    <TableHead className="text-right">Tercepat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.poly}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-purple-600">
                          {formatWaitingTime(item.average_waiting_time_minutes, true)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.longest_waiting_time_minutes && item.longest_waiting_time_minutes > 30 ? "text-red-600" : ""}>
                          {formatWaitingTime(item.longest_waiting_time_minutes)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600">
                          {formatWaitingTime(item.fastest_waiting_time_minutes)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BusyHourReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = useBusyHourReport(params)
  const exportMutation = useExportBusyHour()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const totalReservations = data.data.reduce((sum, d) => sum + d.total_reservations, 0)
    const avgPerDay = totalReservations / data.data.length
    const busiest = data.data.reduce((max, d) => d.total_reservations > max.total_reservations ? d : max, data.data[0])
    
    // Calculate overall busiest hour
    const hourlyTotals: Record<string, number> = {}
    data.data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (/^\d{2}:\d{2}$/.test(key)) {
          hourlyTotals[key] = (hourlyTotals[key] || 0) + Number(item[key])
        }
      })
    })
    
    let peakHour = "-"
    let maxHourlyCount = 0
    Object.entries(hourlyTotals).forEach(([hour, count]) => {
      if (count > maxHourlyCount) {
        maxHourlyCount = count
        peakHour = hour
      }
    })

    const allHours = Object.keys(hourlyTotals).sort()

    return { totalReservations, avgPerDay: Math.round(avgPerDay), busiest, peakHour, maxHourlyCount, allHours }
  }, [data])

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Reservasi"
            value={stats.totalReservations}
            icon={Users}
            color="amber"
          />
          <KPICard
            title="Rata-rata/Hari"
            value={stats.avgPerDay}
            icon={BarChart3}
            color="blue"
          />
          <KPICard
            title="Jam Tersibuk"
            value={stats.peakHour}
            subtitle={`${stats.maxHourlyCount} pasien`}
            icon={Clock}
            color="orange"
          />
          <KPICard
            title="Poli Tersibuk"
            value={stats.busiest.poly}
            icon={Building}
            color="purple"
          />
        </div>
      )}

      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-amber-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-600" />
                Laporan Jam Sibuk
              </CardTitle>
              <CardDescription>Distribusi reservasi per jam</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Tidak ada data jam sibuk"
              description="Coba perluas rentang tanggal untuk melihat distribusi jam sibuk."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Poli</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Jam Puncak</TableHead>
                    <TableHead className="w-[40%]">Distribusi per Jam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => {
                    const hourlyData = stats?.allHours.map(h => ({ hour: h, count: Number(item[h] || 0) })) || []
                    const peak = hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: "-", count: 0 })
                    const maxCount = Math.max(...hourlyData.map(d => d.count), 1) // Avoid div by 0

                    return (
                      <TableRow key={i} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.poly}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.total_reservations}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-amber-700">{peak.hour}</span>
                            <span className="text-xs text-muted-foreground">{peak.count} pasien</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-end gap-1 h-12 py-1">
                            {hourlyData.map((d) => {
                              const heightPercent = (d.count / maxCount) * 100
                              const isPeak = d.hour === peak.hour && d.count > 0
                              return (
                                <div 
                                  key={d.hour} 
                                  className="flex flex-col items-center justify-end h-full gap-0.5 group relative"
                                  style={{ width: `${100 / Math.max(hourlyData.length, 1)}%` }}
                                >
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm border whitespace-nowrap z-10">
                                    <span className="font-semibold">{d.hour}</span>
                                    <span>{d.count} psn</span>
                                  </div>
                                  
                                  {/* Bar */}
                                  <div 
                                    className={cn(
                                      "w-full rounded-t-sm transition-all",
                                      isPeak ? "bg-amber-500" : "bg-muted-foreground/30 hover:bg-amber-400"
                                    )}
                                    style={{ height: `${Math.max(heightPercent, 10)}%` }} // min height for visibility
                                  />
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
                            <span>{hourlyData[0]?.hour}</span>
                            <span>{hourlyData[hourlyData.length - 1]?.hour}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UserActivityReportSection({ params }: { params: ReportParams }) {
  const { data, isLoading } = useUserActivityReport(params)
  const exportMutation = useExportUserActivity()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    }
  }

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      <Card className="pt-0 gap-0">
        <CardHeader className="pt-6 bg-gradient-to-r from-slate-50 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-700" />
                Laporan Aktivitas User
              </CardTitle>
              <CardDescription>Aktivitas user berdasarkan filter</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tidak ada aktivitas"
              description="Coba ubah filter atau rentang tanggal untuk melihat aktivitas user."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Aktivitas</TableHead>
                    <TableHead>ID Reservasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.role}</Badge>
                      </TableCell>
                      <TableCell>{item.activity}</TableCell>
                      <TableCell>{item.reservation_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
