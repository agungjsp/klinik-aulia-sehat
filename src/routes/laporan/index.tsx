import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { format, subDays } from "date-fns"
import { useTranslation } from "react-i18next"
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
  useStatusList,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTablePagination } from "@/components/data-table"
import { PolySelect } from "@/components/poly"
import { UserSelect } from "@/components/user"
import i18nInstance from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { getLocaleByLanguage } from "@/lib/i18n/date-locale"
import type {
  DataTableColumn,
  DataTablePaginationMeta,
  ReportParams,
  PatientVisitReportItem,
  NoShowCancelledReportItem,
  BpjsVsGeneralReportItem,
  PolyPerformanceReportItem,
  WaitingTimeReportItem,
  BusyHourReportItem,
  UserActivityReportItem,
} from "@/types"

export const Route = createFileRoute("/laporan/")({
  component: LaporanPage,
})

function LaporanPage() {
  const { t, i18n: currentI18n } = useTranslation(["reports", "common", "queue"])
  const { dateFnsLocale } = getLocaleByLanguage(currentI18n.language)
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

  const { data: statusData } = useStatusList()
  const statuses = statusData?.data || []

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
          <h1 className="text-2xl font-bold">{t("reports:page.title")}</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: dateFnsLocale })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t("reports:page.filterTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label htmlFor="date_from">{t("reports:page.dateFrom")}</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px] bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date_to">{t("reports:page.dateTo")}</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px] bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label>{t("common:labels.poly")}</Label>
              <PolySelect
                value={selectedPolyId}
                onChange={setSelectedPolyId}
                className="w-[150px] bg-background"
                showAll
                allLabel={t("reports:page.allPolies")}
                showIcon={false}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("reports:page.insurance")}</Label>
              <Select
                value={insuranceType ?? "all"}
                onValueChange={(v) => setInsuranceType(v === "all" ? undefined : v === "BPJS" ? "BPJS" : "GENERAL")}
              >
                <SelectTrigger className="w-[160px] bg-background">
                  <SelectValue placeholder={t("common:actions.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common:actions.all")}</SelectItem>
                  <SelectItem value="BPJS">{t("queue:patientTypes.bpjs")}</SelectItem>
                  <SelectItem value="GENERAL">{t("queue:patientTypes.general")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t("common:labels.status")}</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between bg-background">
                    {selectedStatusIds.length > 0
                      ? t("reports:page.statusSelected", { count: selectedStatusIds.length })
                      : t("common:actions.all")}
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
              <Label>{t("reports:userActivity.columns.user")}</Label>
              <UserSelect
                value={selectedUserId}
                onChange={setSelectedUserId}
                className="w-[180px] bg-background"
                showAll
                allLabel={t("reports:page.allUsers")}
                showIcon={false}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("reports:page.page")}</Label>
              <Input
                type="number"
                value={page}
                min={1}
                onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
                className="w-[100px] bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label>{t("reports:page.perPage")}</Label>
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
            {t("reports:tabs.patientVisits")}
          </TabsTrigger>
          <TabsTrigger value="no-show" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <UserX className="h-4 w-4" />
            {t("reports:tabs.noShowCancelled")}
          </TabsTrigger>
          <TabsTrigger value="bpjs" className="gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <FileSpreadsheet className="h-4 w-4" />
            {t("reports:tabs.bpjsVsGeneral")}
          </TabsTrigger>
          <TabsTrigger value="poly-performance" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building className="h-4 w-4" />
            {t("reports:tabs.polyPerformance")}
          </TabsTrigger>
          <TabsTrigger value="waiting-time" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Clock className="h-4 w-4" />
            {t("reports:tabs.waitingTime")}
          </TabsTrigger>
          <TabsTrigger value="busy-hour" className="gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4" />
            {t("reports:tabs.busyHour")}
          </TabsTrigger>
          <TabsTrigger value="user-activity" className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            {t("reports:tabs.userActivity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient-visits">
          <PatientVisitsReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
        </TabsContent>

        <TabsContent value="no-show">
          <NoShowReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
        </TabsContent>

        <TabsContent value="bpjs">
          <BpjsReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
        </TabsContent>

        <TabsContent value="poly-performance">
          <PolyPerformanceReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
        </TabsContent>

        <TabsContent value="waiting-time">
          <WaitingTimeReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
        </TabsContent>

        <TabsContent value="busy-hour">
          <BusyHourReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
        </TabsContent>

        <TabsContent value="user-activity">
          <UserActivityReportSection params={reportParams} page={page} perPage={perPage} setPage={setPage} setPerPage={setPerPage} />
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

  const value = isAverage ? Math.round(minutes * 10) / 10 : Math.round(minutes)
  return i18nInstance.t("reports:format.minutes", { value })
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

function toDataTablePaginationMeta(pagination: { current_page: number; per_page: number; total: number; last_page: number }): DataTablePaginationMeta {
  const currentPage = pagination.current_page ?? 1
  const totalPages = pagination.last_page ?? 1

  return {
    currentPage,
    totalPages,
    perPage: pagination.per_page ?? 10,
    totalItems: pagination.total ?? 0,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  }
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

function PatientVisitsReportSection({ params, page, perPage, setPage, setPerPage }: { 
  params: ReportParams
  page: number
  perPage: number
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
}) {
  const { t } = useTranslation(["reports", "queue"])
  void page
  void perPage
  const { data, isLoading } = usePatientVisitsReport(params)
  const exportMutation = useExportPatientVisits()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const total = data.data.length
    const completed = data.data.filter((d) => d.status === "DONE" || d.status === "Selesai" || d.status === "Done").length
    const bpjs = data.data.filter((d) => d.insurance_type === "BPJS").length
    const avgWait = data.data.filter((d) => d.waiting_time_minutes).reduce((sum, d) => sum + (d.waiting_time_minutes || 0), 0) / (data.data.filter((d) => d.waiting_time_minutes).length || 1)
    return { total, completed, bpjs, avgWait: Math.round(avgWait) }
  }, [data])

  const columns: DataTableColumn<PatientVisitReportItem>[] = [
    { id: "date", header: t("reports:patientVisits.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "patient_name", header: t("reports:patientVisits.columns.patientName"), cell: (item) => item.patient_name, widthClassName: "min-w-[220px]" },
    { id: "poly", header: t("reports:patientVisits.columns.poly"), cell: (item) => <Badge variant="outline">{item.poly}</Badge>, widthClassName: "w-36" },
    {
      id: "insurance_type",
      header: t("reports:patientVisits.columns.type"),
      cell: (item) => (
        <Badge variant={item.insurance_type === "BPJS" ? "default" : "secondary"}>
          {item.insurance_type === "BPJS" ? t("queue:patientTypes.bpjs") : t("queue:patientTypes.general")}
        </Badge>
      ),
      widthClassName: "w-28",
    },
    {
      id: "status",
      header: t("reports:patientVisits.columns.status"),
      cell: (item) => <Badge variant={item.status === "DONE" || item.status === "Selesai" || item.status === "Done" ? "default" : "outline"}>{item.status}</Badge>,
      widthClassName: "w-32",
    },
    {
      id: "waiting_time",
      header: t("reports:patientVisits.columns.waitingTime"),
      cell: (item) => formatWaitingTime(item.waiting_time_minutes),
      widthClassName: "w-36",
      align: "right",
    },
  ]

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t("reports:patientVisits.kpi.totalVisits")}
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <KPICard
            title={t("reports:patientVisits.kpi.completed")}
            value={stats.completed}
            subtitle={t("reports:format.percentOfTotal", {
              percent: ((stats.completed / stats.total) * 100).toFixed(0),
            })}
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title={t("reports:patientVisits.kpi.bpjsPatients")}
            value={stats.bpjs}
            subtitle={t("reports:format.percentOfTotal", {
              percent: ((stats.bpjs / stats.total) * 100).toFixed(0),
            })}
            icon={FileSpreadsheet}
            color="purple"
          />
          <KPICard
            title={t("reports:patientVisits.kpi.averageWait")}
            value={formatWaitingTime(stats.avgWait)}
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
                {t("reports:patientVisits.title")}
              </CardTitle>
              <CardDescription>{t("reports:patientVisits.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("reports:patientVisits.emptyTitle")}
              description={t("reports:patientVisits.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.patient_name}-${idx}`}
              variant="report"
              emptyMessage={t("reports:patientVisits.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}

function NoShowReportSection({ params, page, perPage, setPage, setPerPage }: { params: ReportParams; page: number; perPage: number; setPage: (page: number) => void; setPerPage: (perPage: number) => void }) {
  const { t } = useTranslation(["reports"])
  void page
  void perPage
  const { data, isLoading } = useNoShowCancelledReport(params)
  const exportMutation = useExportNoShowCancelled()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
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

  const columns: DataTableColumn<NoShowCancelledReportItem>[] = [
    { id: "date", header: t("reports:noShow.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "poly", header: t("reports:noShow.columns.poly"), cell: (item) => <Badge variant="outline">{item.poly}</Badge>, widthClassName: "w-36" },
    {
      id: "total_reservations",
      header: t("reports:noShow.columns.totalReservations"),
      cell: (item) => item.total_reservations,
      align: "right",
      widthClassName: "w-40",
    },
    {
      id: "no_show",
      header: t("reports:noShow.columns.noShow"),
      align: "right",
      widthClassName: "w-28",
      cell: (item) => <span className={item.no_show > 0 ? "text-orange-600 font-medium" : ""}>{item.no_show}</span>,
    },
    {
      id: "cancelled",
      header: t("reports:noShow.columns.cancelled"),
      align: "right",
      widthClassName: "w-28",
      cell: (item) => <span className={item.cancelled > 0 ? "text-red-600 font-medium" : ""}>{item.cancelled}</span>,
    },
    {
      id: "ratio_percent",
      header: t("reports:noShow.columns.ratio"),
      align: "right",
      widthClassName: "w-28",
      cell: (item) => <Badge variant={item.ratio_percent > 10 ? "destructive" : "secondary"}>{item.ratio_percent.toFixed(1)}%</Badge>,
    },
  ]

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t("reports:noShow.kpi.totalReservations")}
            value={stats.totalReservations}
            icon={Users}
            color="blue"
          />
          <KPICard
            title={t("reports:noShow.kpi.noShow")}
            value={stats.totalNoShow}
            subtitle={`${stats.totalReservations > 0 ? ((stats.totalNoShow / stats.totalReservations) * 100).toFixed(1) : 0}%`}
            icon={UserX}
            color="orange"
          />
          <KPICard
            title={t("reports:noShow.kpi.cancelled")}
            value={stats.totalCancelled}
            subtitle={`${stats.totalReservations > 0 ? ((stats.totalCancelled / stats.totalReservations) * 100).toFixed(1) : 0}%`}
            icon={XCircle}
            color="red"
          />
          <KPICard
            title={t("reports:noShow.kpi.failedRatio")}
            value={`${stats.avgRatio.toFixed(1)}%`}
            subtitle={t("reports:noShow.kpi.failedRatioSubtitle")}
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
                {t("reports:noShow.title")}
              </CardTitle>
              <CardDescription>{t("reports:noShow.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={UserX}
              title={t("reports:noShow.emptyTitle")}
              description={t("reports:noShow.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.poly}-${idx}`}
              variant="report"
              emptyMessage={t("reports:noShow.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}

function BpjsReportSection({ params, page, perPage, setPage, setPerPage }: { params: ReportParams; page: number; perPage: number; setPage: (page: number) => void; setPerPage: (perPage: number) => void }) {
  const { t } = useTranslation(["reports", "queue"])
  void page
  void perPage
  const { data, isLoading } = useBpjsVsGeneralReport(params)
  const exportMutation = useExportBpjsVsGeneral()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
    }
  }

  const stats = useMemo(() => {
    if (!data?.data || data.data.length === 0) return null
    const totalBpjs = data.data.reduce((sum, d) => sum + d.total_bpjs, 0)
    const totalGeneral = data.data.reduce((sum, d) => sum + d.total_general, 0)
    const total = totalBpjs + totalGeneral
    return { totalBpjs, totalGeneral, total }
  }, [data])

  const columns: DataTableColumn<BpjsVsGeneralReportItem>[] = [
    { id: "date", header: t("reports:bpjsVsGeneral.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "poly", header: t("reports:bpjsVsGeneral.columns.poly"), cell: (item) => <Badge variant="outline">{item.poly}</Badge>, widthClassName: "w-36" },
    {
      id: "total_bpjs",
      header: t("reports:bpjsVsGeneral.columns.bpjs"),
      align: "right",
      widthClassName: "w-24",
      cell: (item) => <span className="text-green-600 font-medium">{item.total_bpjs}</span>,
    },
    {
      id: "total_general",
      header: t("reports:bpjsVsGeneral.columns.general"),
      align: "right",
      widthClassName: "w-24",
      cell: (item) => <span className="text-purple-600 font-medium">{item.total_general}</span>,
    },
    {
      id: "bpjs_percentage",
      header: t("reports:bpjsVsGeneral.columns.bpjsPercentage"),
      align: "right",
      widthClassName: "w-28",
      cell: (item) => <Badge variant="default" className="bg-green-600">{item.bpjs_percentage.toFixed(1)}%</Badge>,
    },
    {
      id: "general_percentage",
      header: t("reports:bpjsVsGeneral.columns.generalPercentage"),
      align: "right",
      widthClassName: "w-28",
      cell: (item) => <Badge variant="secondary">{item.general_percentage.toFixed(1)}%</Badge>,
    },
  ]

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t("reports:bpjsVsGeneral.kpi.totalPatients")}
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <KPICard
            title={t("reports:bpjsVsGeneral.kpi.bpjsPatients")}
            value={stats.totalBpjs}
            subtitle={t("reports:format.percentOfTotal", {
              percent: ((stats.totalBpjs / stats.total) * 100).toFixed(0),
            })}
            icon={FileSpreadsheet}
            color="green"
          />
          <KPICard
            title={t("reports:bpjsVsGeneral.kpi.generalPatients")}
            value={stats.totalGeneral}
            subtitle={t("reports:format.percentOfTotal", {
              percent: ((stats.totalGeneral / stats.total) * 100).toFixed(0),
            })}
            icon={Users}
            color="purple"
          />
          <KPICard
            title={t("reports:bpjsVsGeneral.kpi.ratio")}
            value={
              stats.totalGeneral > 0
                ? `${(stats.totalBpjs / stats.totalGeneral).toFixed(1)}:1`
                : t("reports:bpjsVsGeneral.kpi.ratioFallback")
            }
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
                {t("reports:bpjsVsGeneral.title")}
              </CardTitle>
              <CardDescription>{t("reports:bpjsVsGeneral.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title={t("reports:bpjsVsGeneral.emptyTitle")}
              description={t("reports:bpjsVsGeneral.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.poly}-${idx}`}
              variant="report"
              emptyMessage={t("reports:bpjsVsGeneral.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}

function PolyPerformanceReportSection({ params, page, perPage, setPage, setPerPage }: { params: ReportParams; page: number; perPage: number; setPage: (page: number) => void; setPerPage: (perPage: number) => void }) {
  const { t } = useTranslation(["reports"])
  void page
  void perPage
  const { data, isLoading } = usePolyPerformanceReport(params)
  const exportMutation = useExportPolyPerformance()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
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

  const columns: DataTableColumn<PolyPerformanceReportItem>[] = [
    { id: "date", header: t("reports:polyPerformance.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "poly", header: t("reports:polyPerformance.columns.poly"), cell: (item) => <Badge variant="outline">{item.poly}</Badge>, widthClassName: "w-36" },
    {
      id: "total_patients",
      header: t("reports:polyPerformance.columns.totalPatients"),
      align: "right",
      widthClassName: "w-32",
      cell: (item) => <span className="font-medium">{item.total_patients}</span>,
    },
    {
      id: "avg_wait",
      header: t("reports:polyPerformance.columns.waitingTime"),
      align: "right",
      widthClassName: "w-36",
      cell: (item) => formatWaitingTime(item.average_waiting_time_minutes, true),
    },
    {
      id: "no_show_rate",
      header: t("reports:polyPerformance.columns.noShowRate"),
      align: "right",
      widthClassName: "w-36",
      cell: (item) => <Badge variant={item.no_show_rate_percent > 10 ? "destructive" : "secondary"}>{item.no_show_rate_percent.toFixed(1)}%</Badge>,
    },
    {
      id: "peak_hour",
      header: t("reports:polyPerformance.columns.peakHour"),
      widthClassName: "w-36",
      cell: (item) => <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{item.peak_hour}</Badge>,
    },
  ]

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t("reports:polyPerformance.kpi.totalPatients")}
            value={stats.totalPatients}
            icon={Users}
            color="blue"
          />
          <KPICard
            title={t("reports:polyPerformance.kpi.averageWait")}
            value={formatWaitingTime(stats.avgWait)}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title={t("reports:polyPerformance.kpi.averageNoShow")}
            value={`${stats.avgNoShow.toFixed(1)}%`}
            icon={UserX}
            color="orange"
          />
          <KPICard
            title={t("reports:polyPerformance.kpi.busiestPoly")}
            value={stats.topPoly.poly}
            subtitle={t("reports:format.patientCount", { count: stats.topPoly.total_patients })}
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
                {t("reports:polyPerformance.title")}
              </CardTitle>
              <CardDescription>{t("reports:polyPerformance.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Building}
              title={t("reports:polyPerformance.emptyTitle")}
              description={t("reports:polyPerformance.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.poly}-${idx}`}
              variant="report"
              emptyMessage={t("reports:polyPerformance.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}

function WaitingTimeReportSection({ params, page, perPage, setPage, setPerPage }: { params: ReportParams; page: number; perPage: number; setPage: (page: number) => void; setPerPage: (perPage: number) => void }) {
  const { t } = useTranslation(["reports"])
  void page
  void perPage
  const { data, isLoading } = useWaitingTimeReport(params)
  const exportMutation = useExportWaitingTime()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
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

  const columns: DataTableColumn<WaitingTimeReportItem>[] = [
    { id: "date", header: t("reports:waitingTime.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "poly", header: t("reports:waitingTime.columns.poly"), cell: (item) => <Badge variant="outline">{item.poly}</Badge>, widthClassName: "w-36" },
    {
      id: "average_waiting_time_minutes",
      header: t("reports:waitingTime.columns.average"),
      align: "right",
      widthClassName: "w-36",
      cell: (item) => <span className="font-medium text-purple-600">{formatWaitingTime(item.average_waiting_time_minutes, true)}</span>,
    },
    {
      id: "longest_waiting_time_minutes",
      header: t("reports:waitingTime.columns.longest"),
      align: "right",
      widthClassName: "w-36",
      cell: (item) => (
        <span className={item.longest_waiting_time_minutes && item.longest_waiting_time_minutes > 30 ? "text-red-600" : ""}>
          {formatWaitingTime(item.longest_waiting_time_minutes)}
        </span>
      ),
    },
    {
      id: "fastest_waiting_time_minutes",
      header: t("reports:waitingTime.columns.fastest"),
      align: "right",
      widthClassName: "w-36",
      cell: (item) => <span className="text-green-600">{formatWaitingTime(item.fastest_waiting_time_minutes)}</span>,
    },
  ]

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t("reports:waitingTime.kpi.averageWait")}
            value={formatWaitingTime(stats.avgWait)}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title={t("reports:waitingTime.kpi.longestWait")}
            value={formatWaitingTime(stats.maxWait)}
            icon={Hourglass}
            color="red"
          />
          <KPICard
            title={t("reports:waitingTime.kpi.fastestWait")}
            value={formatWaitingTime(stats.minWait)}
            icon={TrendingDown}
            color="green"
          />
          <KPICard
            title={t("reports:waitingTime.kpi.fastestPoly")}
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
                {t("reports:waitingTime.title")}
              </CardTitle>
              <CardDescription>{t("reports:waitingTime.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={t("reports:waitingTime.emptyTitle")}
              description={t("reports:waitingTime.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.poly}-${idx}`}
              variant="report"
              emptyMessage={t("reports:waitingTime.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}

function BusyHourReportSection({ params, page, perPage, setPage, setPerPage }: { params: ReportParams; page: number; perPage: number; setPage: (page: number) => void; setPerPage: (perPage: number) => void }) {
  const { t } = useTranslation(["reports"])
  void page
  void perPage
  const { data, isLoading } = useBusyHourReport(params)
  const exportMutation = useExportBusyHour()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
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

  const columns: DataTableColumn<BusyHourReportItem>[] = [
    { id: "date", header: t("reports:busyHour.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "poly", header: t("reports:busyHour.columns.poly"), cell: (item) => <Badge variant="outline">{item.poly}</Badge>, widthClassName: "w-36" },
    {
      id: "total_reservations",
      header: t("reports:busyHour.columns.total"),
      align: "right",
      widthClassName: "w-24",
      cell: (item) => <span className="font-medium">{item.total_reservations}</span>,
    },
    {
      id: "peak_hour",
      header: t("reports:busyHour.columns.peakHour"),
      widthClassName: "w-32",
      cell: (item) => {
        const hourlyData = stats?.allHours.map((hour) => ({ hour, count: Number(item[hour] || 0) })) || []
        const peak = hourlyData.reduce((max, current) => (current.count > max.count ? current : max), { hour: "-", count: 0 })

        return (
          <div className="flex flex-col">
            <span className="font-medium text-amber-700">{peak.hour}</span>
            <span className="text-xs text-muted-foreground">{t("reports:format.patientCount", { count: peak.count })}</span>
          </div>
        )
      },
    },
    {
      id: "distribution",
      header: t("reports:busyHour.columns.hourlyDistribution"),
      widthClassName: "min-w-[340px]",
      cell: (item) => {
        const hourlyData = stats?.allHours.map((hour) => ({ hour, count: Number(item[hour] || 0) })) || []
        const peak = hourlyData.reduce((max, current) => (current.count > max.count ? current : max), { hour: "-", count: 0 })
        const maxCount = Math.max(...hourlyData.map((entry) => entry.count), 1)

        return (
          <div>
            <div className="flex h-12 items-end gap-1 py-1">
              {hourlyData.map((entry) => {
                const heightPercent = (entry.count / maxCount) * 100
                const isPeak = entry.hour === peak.hour && entry.count > 0

                return (
                  <div
                    key={entry.hour}
                    className="group relative flex h-full flex-col items-center justify-end gap-0.5"
                    style={{ width: `${100 / Math.max(hourlyData.length, 1)}%` }}
                  >
                    <div className="absolute bottom-full z-10 mb-1 hidden flex-col items-center whitespace-nowrap rounded border bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow-sm group-hover:flex">
                      <span className="font-semibold">{entry.hour}</span>
                      <span>{t("reports:format.patientShort", { count: entry.count })}</span>
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-t-sm transition-all",
                        isPeak ? "bg-amber-500" : "bg-muted-foreground/30 hover:bg-amber-400",
                      )}
                      style={{ height: `${Math.max(heightPercent, 10)}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
              <span>{hourlyData[0]?.hour}</span>
              <span>{hourlyData[hourlyData.length - 1]?.hour}</span>
            </div>
          </div>
        )
      },
    },
  ]

  if (isLoading) return <ReportSkeleton />

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title={t("reports:busyHour.kpi.totalReservations")}
            value={stats.totalReservations}
            icon={Users}
            color="amber"
          />
          <KPICard
            title={t("reports:busyHour.kpi.averagePerDay")}
            value={stats.avgPerDay}
            icon={BarChart3}
            color="blue"
          />
          <KPICard
            title={t("reports:busyHour.kpi.busiestHour")}
            value={stats.peakHour}
            subtitle={t("reports:format.patientCount", { count: stats.maxHourlyCount })}
            icon={Clock}
            color="orange"
          />
          <KPICard
            title={t("reports:busyHour.kpi.busiestPoly")}
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
                {t("reports:busyHour.title")}
              </CardTitle>
              <CardDescription>{t("reports:busyHour.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Activity}
              title={t("reports:busyHour.emptyTitle")}
              description={t("reports:busyHour.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.poly}-${idx}`}
              variant="report"
              emptyMessage={t("reports:busyHour.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}

function UserActivityReportSection({ params, page, perPage, setPage, setPerPage }: { params: ReportParams; page: number; perPage: number; setPage: (page: number) => void; setPerPage: (perPage: number) => void }) {
  const { t } = useTranslation(["reports"])
  void page
  void perPage
  const { data, isLoading } = useUserActivityReport(params)
  const exportMutation = useExportUserActivity()

  const columns: DataTableColumn<UserActivityReportItem>[] = [
    { id: "date", header: t("reports:userActivity.columns.date"), cell: (item) => <span className="font-medium">{item.date}</span>, widthClassName: "w-36" },
    { id: "user", header: t("reports:userActivity.columns.user"), cell: (item) => item.user, widthClassName: "min-w-[180px]" },
    { id: "role", header: t("reports:userActivity.columns.role"), cell: (item) => <Badge variant="outline">{item.role}</Badge>, widthClassName: "w-32" },
    { id: "activity", header: t("reports:userActivity.columns.activity"), cell: (item) => item.activity, widthClassName: "min-w-[220px]" },
    { id: "reservation_id", header: t("reports:userActivity.columns.reservationId"), cell: (item) => item.reservation_id, widthClassName: "w-32", align: "right" },
  ]

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(params)
      toast.success(t("reports:toasts.exportSuccess"))
    } catch {
      toast.error(t("reports:toasts.exportFailed"))
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
                {t("reports:userActivity.title")}
              </CardTitle>
              <CardDescription>{t("reports:userActivity.description")}</CardDescription>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} variant="outline" className="shrink-0">
              {exportMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t("reports:actions.exportExcel")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("reports:userActivity.emptyTitle")}
              description={t("reports:userActivity.emptyDescription")}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={data.data}
              rowKey={(row, idx) => `${row.date}-${row.user}-${idx}`}
              variant="report"
              emptyMessage={t("reports:userActivity.emptyMessage")}
            />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.total > 0 && (
        <DataTablePagination
          meta={toDataTablePaginationMeta(data.pagination)}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          isPending={isLoading}
        />
      )}
    </div>
  )
}
