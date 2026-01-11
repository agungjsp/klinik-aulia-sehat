import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  useDashboardSummary,
  useDashboardReservationTrend,
  useDashboardReservationsByPoly,
  useDashboardPatientAttendance,
  useDashboardAverageWaitingTime,
  useDashboardClinicPeakHours,
  useDashboardBpjsVsGeneral,
  usePolyList,
} from "@/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Calendar, CheckCircle, XCircle, Clock, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardTrendItem, DashboardSummaryItem, DashboardReservationsByPolyItem, DashboardPatientAttendance, DashboardAverageWaitingTimeItem, DashboardPeakHourItem, DashboardBpjsVsGeneralItem } from "@/types"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

// Helper to process trend data into a consistent format
interface ProcessedTrendItem {
  label: string
  value: number
  breakdown: { name: string; value: number }[]
}

function processTrendData(
  trendData: DashboardTrendItem[],
  polies: { id: number; name: string }[]
): { items: ProcessedTrendItem[]; globalMax: number } {
  if (!trendData || trendData.length === 0) {
    return { items: [], globalMax: 0 }
  }

  const items: ProcessedTrendItem[] = trendData.map((item) => {
    const label = String(item.label)
    const breakdown: { name: string; value: number }[] = []

    // Extract numeric values (poly data)
    let total = 0
    for (const [key, val] of Object.entries(item)) {
      if (key !== "label" && typeof val === "number") {
        const polyName = polies.find((p) => p.name === key)?.name || key
        breakdown.push({ name: polyName, value: val })
        total += val
      }
    }

    // Sort breakdown by value descending
    breakdown.sort((a, b) => b.value - a.value)

    return {
      label,
      value: total,
      breakdown,
    }
  })

  const globalMax = Math.max(...items.map((i) => i.value), 1)

  return { items, globalMax }
}

function DashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Filter states
  const [selectedPolyId, setSelectedPolyId] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(currentMonth)

  // Queries with staleTime to prevent refetch storms
  const { data: polyData, isLoading: polyLoading } = usePolyList()
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary({
    date: today,
    poly_id: selectedPolyId,
  })
  const { data: trendData, isLoading: trendLoading } = useDashboardReservationTrend({
    year: selectedYear,
    month: selectedMonth,
    poly_id: selectedPolyId,
  })
  const { data: polyDistData, isLoading: polyDistLoading } = useDashboardReservationsByPoly({
    year: selectedYear,
    month: selectedMonth,
  })
  const { data: attendanceData, isLoading: attendanceLoading } = useDashboardPatientAttendance({
    year: selectedYear,
    month: selectedMonth,
    poly_id: selectedPolyId,
  })
  const { data: waitingTimeData, isLoading: waitingTimeLoading } = useDashboardAverageWaitingTime({
    year: selectedYear,
    month: selectedMonth,
  })
  const { data: peakHoursData, isLoading: peakHoursLoading } = useDashboardClinicPeakHours({
    date: today,
    poly_id: selectedPolyId,
  })
  const { data: bpjsData, isLoading: bpjsLoading } = useDashboardBpjsVsGeneral({
    year: selectedYear,
    month: selectedMonth,
    poly_id: selectedPolyId,
  })

  const polies = polyData?.data || []
  const summary = summaryData?.data || []
  const trend = trendData?.data || []
  const polyDist = polyDistData?.data || []
  const attendance = attendanceData?.data
  const waitingTime = waitingTimeData?.data || []
  const peakHours = peakHoursData?.data || []
  const bpjs = bpjsData?.data || []

  // Process trend data with memoization
  const { items: processedTrend, globalMax: trendGlobalMax } = useMemo(
    () => processTrendData(trend, polies),
    [trend, polies]
  )

  // Memoize peak hours max
  const peakHoursMax = useMemo(() => Math.max(...peakHours.map((p) => p.value), 1), [peakHours])

  // Memoize poly distribution max
  const polyDistMax = useMemo(() => Math.max(...polyDist.map((p) => p.value), 1), [polyDist])

  // Get summary values
  const getSummaryValue = (name: string) => {
    const item = summary.find((s: DashboardSummaryItem) => s.name.toLowerCase().includes(name.toLowerCase()))
    return item?.value ?? 0
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ]

  const selectedMonthLabel = selectedMonth
    ? months.find((m) => m.value === selectedMonth)?.label
    : undefined

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedPolyId ? String(selectedPolyId) : "all"}
              onValueChange={(v) => setSelectedPolyId(v === "all" ? undefined : Number(v))}
            >
              <SelectTrigger className="w-[150px]">
                {polyLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <SelectValue placeholder="Semua Poli" />
                )}
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
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth ? String(selectedMonth) : "all"}
              onValueChange={(v) => setSelectedMonth(v === "all" ? undefined : Number(v))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Semua Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Antrean"
            value={getSummaryValue("total")}
            icon={Users}
            color="blue"
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Total Pasien"
            value={getSummaryValue("patient") || getSummaryValue("pasien")}
            icon={Calendar}
            color="purple"
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Selesai"
            value={getSummaryValue("completed") || getSummaryValue("selesai")}
            icon={CheckCircle}
            color="green"
            isLoading={summaryLoading}
          />
          <SummaryCard
            title="Tidak Hadir"
            value={getSummaryValue("no_show") || getSummaryValue("tidak")}
            icon={XCircle}
            color="gray"
            isLoading={summaryLoading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Reservation Trend - Improved */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Reservasi</CardTitle>
              <CardDescription>
                {selectedMonthLabel
                  ? `Jumlah reservasi harian bulan ${selectedMonthLabel} ${selectedYear}`
                  : `Jumlah reservasi bulanan tahun ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <div className="h-64 flex items-end justify-between gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="flex-1 h-32" />
                  ))}
                </div>
              ) : processedTrend.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                  <p>Tidak ada data reservasi</p>
                  <p className="text-sm mt-1">
                    {selectedMonthLabel
                      ? `untuk bulan ${selectedMonthLabel} ${selectedYear}`
                      : `untuk tahun ${selectedYear}`}
                  </p>
                </div>
              ) : (
                <div className="h-64 flex items-end justify-between gap-1">
                  {processedTrend.slice(0, selectedMonth ? 31 : 12).map((item, i) => {
                    const barHeight = (item.value / trendGlobalMax) * 200
                    const topBreakdown = item.breakdown.slice(0, 3)

                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div className="flex-1 flex flex-col items-center gap-1 cursor-pointer group">
                            <div
                              className="w-full bg-blue-500 rounded-t transition-colors group-hover:bg-blue-600"
                              style={{ height: `${Math.max(barHeight, 4)}px` }}
                            />
                            <span className="text-xs text-muted-foreground truncate max-w-full">
                              {selectedMonth ? item.label : item.label.slice(0, 3)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-muted-foreground">
                              Total: <span className="font-medium text-foreground">{item.value}</span> reservasi
                            </p>
                            {topBreakdown.length > 0 && (
                              <div className="mt-1 pt-1 border-t text-xs space-y-0.5">
                                {topBreakdown.map((b, j) => (
                                  <div key={j} className="flex justify-between gap-4">
                                    <span>{b.name}</span>
                                    <span className="font-medium">{b.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservations by Poly */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi per Poli</CardTitle>
              <CardDescription>Jumlah reservasi per poli</CardDescription>
            </CardHeader>
            <CardContent>
              {polyDistLoading ? (
                <div className="h-64 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : polyDist.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              ) : (
                <div className="h-64 space-y-3 overflow-y-auto">
                  {polyDist.map((item: DashboardReservationsByPolyItem, i: number) => {
                    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", colors[i % colors.length])}
                            style={{ width: `${(item.value / polyDistMax) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Patient Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Kehadiran Pasien</CardTitle>
              <CardDescription>Rasio kehadiran</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="h-40 flex flex-col items-center justify-center space-y-3">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex justify-between w-full">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ) : !attendance ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">
                      {(attendance as DashboardPatientAttendance).summary.attendance_rate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Tingkat Kehadiran</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <p className="font-medium text-green-600">{(attendance as DashboardPatientAttendance).summary.attended}</p>
                      <p className="text-muted-foreground">Hadir</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-red-600">{(attendance as DashboardPatientAttendance).summary.not_attended}</p>
                      <p className="text-muted-foreground">Tidak Hadir</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{(attendance as DashboardPatientAttendance).summary.total}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Average Waiting Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Waktu Tunggu Rata-rata
              </CardTitle>
              <CardDescription>Per poli</CardDescription>
            </CardHeader>
            <CardContent>
              {waitingTimeLoading ? (
                <div className="h-40 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : waitingTime.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              ) : (
                <div className="h-40 space-y-2 overflow-y-auto">
                  {waitingTime.map((item: DashboardAverageWaitingTimeItem, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-muted/50">
                      <span className="text-sm">{item.name}</span>
                      <span className="font-medium">{item.avg_waiting_time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Jam Sibuk
              </CardTitle>
              <CardDescription>Hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              {peakHoursLoading ? (
                <div className="h-40 flex items-end justify-between gap-0.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="flex-1 h-20" />
                  ))}
                </div>
              ) : peakHours.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              ) : (
                <div className="h-40 flex items-end justify-between gap-0.5 overflow-hidden">
                  {peakHours.slice(0, 12).map((item: DashboardPeakHourItem, i: number) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="flex-1 flex flex-col items-center cursor-pointer group">
                          <div
                            className="w-full bg-orange-500 rounded-t transition-colors group-hover:bg-orange-600"
                            style={{ height: `${Math.max((item.value / peakHoursMax) * 120, 4)}px` }}
                          />
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {item.hour.slice(0, 2)}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{item.hour}</p>
                        <p className="text-muted-foreground">{item.value} reservasi</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BPJS vs General */}
        <Card>
          <CardHeader>
            <CardTitle>BPJS vs Umum</CardTitle>
            <CardDescription>Perbandingan jumlah pasien BPJS dan Umum</CardDescription>
          </CardHeader>
          <CardContent>
            {bpjsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : bpjs.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Tidak ada data
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bpjs.slice(0, 12).map((item: DashboardBpjsVsGeneralItem, i: number) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">{item.label}</p>
                    <div className="flex justify-center gap-2 text-sm">
                      <span className="text-blue-600 font-medium">{item.bpjs} BPJS</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-green-600 font-medium">{item.general} Umum</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: "blue" | "purple" | "green" | "gray"
  isLoading?: boolean
}

function SummaryCard({ title, value, icon: Icon, color, isLoading }: SummaryCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  }

  return (
    <Card className={cn("border", colorStyles[color])}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <Icon className="h-4 w-4 opacity-70" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-20 mt-2" />
        ) : (
          <p className="text-3xl font-bold mt-2">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}
