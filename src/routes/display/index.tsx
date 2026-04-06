import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { useReservationList, useStatusList, usePolyList, useRealtimeQueueAll } from "@/hooks"
import { Clock, Users, Calendar, Stethoscope, Syringe } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLocaleByLanguage } from "@/lib/i18n/date-locale"
import type { Poly, Reservation, QueueStatusName } from "@/types"

const EMPTY_RESERVATIONS: Reservation[] = []

// Poly configuration with distinct theming
const POLY_CONFIG: Record<string, {
  icon: typeof Stethoscope
  gradient: string
  accent: string
  accentLight: string
  accentMuted: string
  glow: string
}> = {
  "Poli Umum": {
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-600",
    accent: "text-emerald-400",
    accentLight: "text-emerald-300",
    accentMuted: "text-emerald-500/60",
    glow: "shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]",
  },
  "Poli Gigi": {
    icon: Syringe,
    gradient: "from-rose-500 to-pink-600",
    accent: "text-rose-400",
    accentLight: "text-rose-300",
    accentMuted: "text-rose-500/60",
    glow: "shadow-[0_0_60px_-15px_rgba(244,63,94,0.4)]",
  },
}

const DEFAULT_CONFIG = {
  icon: Stethoscope,
  gradient: "from-sky-500 to-blue-600",
  accent: "text-sky-400",
  accentLight: "text-sky-300",
  accentMuted: "text-sky-500/60",
  glow: "shadow-[0_0_60px_-15px_rgba(14,165,233,0.4)]",
}

export const Route = createFileRoute("/display/")({
  component: DisplayPage,
})

function DisplayPage() {
  const { t, i18n } = useTranslation(["common", "queue"])
  const { dateFnsLocale } = getLocaleByLanguage(i18n.language)
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: reservationData } = useReservationList({ date: today })
  const { data: statusData } = useStatusList()
  const { data: polyData } = usePolyList()
  const [currentTime, setCurrentTime] = useState(new Date())

  useRealtimeQueueAll(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const reservations = reservationData?.data?.data ?? EMPTY_RESERVATIONS
  const statuses = useMemo(() => statusData?.data ?? [], [statusData?.data])
  // Filter to show only Poli Umum and Poli Gigi
  const targetPolies = useMemo(() => {
    const allPolies = polyData?.data ?? []
    return allPolies.filter(
      (p) => p.name === "Poli Umum" || p.name === "Poli Gigi"
    )
  }, [polyData?.data])

  const statusIdMap = useMemo(() => {
    return statuses.reduce<Record<string, number>>((acc, status) => {
      acc[status.status_name] = status.id
      return acc
    }, {})
  }, [statuses])

  const getStatusId = useCallback(
    (statusName: QueueStatusName) => statusIdMap[statusName],
    [statusIdMap]
  )

  const reservationsByPoly = useMemo(() => {
    const grouped = new Map<number, Reservation[]>()
    for (const reservation of reservations) {
      const polyId = reservation.poly_id
      if (!grouped.has(polyId)) {
        grouped.set(polyId, [])
      }
      grouped.get(polyId)!.push(reservation)
    }
    return grouped
  }, [reservations])

  // Calculate total stats
  const totalWaiting = useMemo(() => {
    const waitingId = statusIdMap.WAITING
    const waitingDoctorId = statusIdMap.WAITING_DOCTOR
    return reservations.filter(
      (r) => r.status_id === waitingId || r.status_id === waitingDoctorId
    ).length
  }, [reservations, statusIdMap])

  const totalServed = useMemo(() => {
    const doneId = statusIdMap.DONE
    return reservations.filter((r) => r.status_id === doneId).length
  }, [reservations, statusIdMap])

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 overflow-hidden font-sans text-white">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-600/8 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex h-28 items-center justify-between px-10 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 blur-xl opacity-50" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl">
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12L6 12M18 12L22 12M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              {t("common:appName").toUpperCase()}
            </h1>
            <p className="text-lg text-emerald-400 font-semibold tracking-wide mt-1">
              {t("common:systemName")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/5">
              <p className="text-3xl font-black text-amber-400 tabular-nums">{totalWaiting}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("common:labels.waiting")}</p>
            </div>
            <div className="text-center px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/5">
              <p className="text-3xl font-black text-emerald-400 tabular-nums">{totalServed}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("common:labels.done")}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-300">
                {format(currentTime, "EEEE", { locale: dateFnsLocale })}
              </p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <p className="text-xl font-bold">
                  {format(currentTime, "d MMMM yyyy", { locale: dateFnsLocale })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/80 px-6 py-4 rounded-2xl border border-emerald-500/20">
              <Clock className="h-8 w-8 text-emerald-400" />
              <span className="text-5xl font-black tabular-nums tracking-tight text-white">
                {format(currentTime, "HH:mm")}
              </span>
              <span className="text-2xl font-bold text-slate-500 tabular-nums">
                {format(currentTime, "ss")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Two Polies Side by Side */}
      <main className="relative z-10 flex-1 px-6 py-7 xl:px-10 2xl:px-14 overflow-hidden">
        <div className="h-full w-full max-w-[2400px] mx-auto grid grid-cols-2 gap-6 2xl:gap-8 3xl:gap-10">
          {targetPolies.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center">
              <div className="text-center bg-slate-900/50 p-16 rounded-3xl border border-white/5">
                <Users className="h-24 w-24 text-slate-600 mx-auto mb-6" />
                <p className="text-4xl font-bold text-slate-500">{t("queue:labels.loadingPolies")}</p>
              </div>
            </div>
          ) : (
            targetPolies.map((poly) => (
              <PolySection
                key={poly.id}
                poly={poly}
                reservations={reservationsByPoly.get(poly.id) || []}
                getStatusId={getStatusId}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer Marquee */}
      <footer className="relative z-10 h-16 bg-slate-900/90 border-t border-white/5 flex items-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="flex w-full whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-24 text-xl font-medium px-4 text-slate-300">
            <span>{`🏥 ${t("common:display.welcome")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{t("common:display.waitingCall")}</span>
            <span className="text-slate-600">•</span>
            <span>{`📞 ${t("common:display.hotline")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{`🕐 ${t("common:display.operationHours")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{`🏥 ${t("common:display.welcome")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{t("common:display.waitingCall")}</span>
            <span className="text-slate-600">•</span>
            <span>{`📞 ${t("common:display.hotline")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{`🕐 ${t("common:display.operationHours")}`}</span>
          </div>
          <div className="animate-marquee flex items-center gap-24 text-xl font-medium px-4 text-slate-300" aria-hidden="true">
            <span>{`🏥 ${t("common:display.welcome")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{t("common:display.waitingCall")}</span>
            <span className="text-slate-600">•</span>
            <span>{`📞 ${t("common:display.hotline")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{`🕐 ${t("common:display.operationHours")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{`🏥 ${t("common:display.welcome")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{t("common:display.waitingCall")}</span>
            <span className="text-slate-600">•</span>
            <span>{`📞 ${t("common:display.hotline")}`}</span>
            <span className="text-slate-600">•</span>
            <span>{`🕐 ${t("common:display.operationHours")}`}</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  )
}

interface PolySectionProps {
  poly: Poly
  reservations: Reservation[]
  getStatusId: (statusName: QueueStatusName) => number | undefined
}

function PolySection({ poly, reservations, getStatusId }: PolySectionProps) {
  const { t } = useTranslation(["common", "queue"])
  const config = POLY_CONFIG[poly.name] || DEFAULT_CONFIG
  const IconComponent = config.icon

  const withDoctorId = getStatusId("WITH_DOCTOR")
  const anamnesaId = getStatusId("ANAMNESA")
  const waitingId = getStatusId("WAITING")
  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const doneId = getStatusId("DONE")
  const noShowId = getStatusId("NO_SHOW")
  const cancelledId = getStatusId("CANCELLED")

  const inConsultation = reservations.find((r) => r.status_id === withDoctorId)
  const inAnamnesa = reservations.find((r) => r.status_id === anamnesaId)
  
  // Get waiting queue sorted by queue number
  const waitingQueue = reservations
    .filter((r) => r.status_id === waitingId || r.status_id === waitingDoctorId)
    .sort((a, b) => Number(a.queue?.queue_number || 0) - Number(b.queue?.queue_number || 0))

  const activeCount = reservations.filter(
    (r) => ![doneId, noShowId, cancelledId].includes(r.status_id)
  ).length

  const formatQueueNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return "---"
    return String(num).padStart(3, "0")
  }

  const cardShell = "rounded-2xl border border-slate-600/85 bg-slate-900/95"
  const labelClass = "text-xs font-semibold uppercase tracking-[0.14em]"

  return (
    <div className="h-full flex flex-col rounded-3xl border border-white/10 bg-slate-900/55 overflow-hidden w-full max-w-[1160px] mx-auto">
      {/* Poly Header */}
      <div className={cn(
        "flex items-center justify-between px-8 py-5 bg-gradient-to-r",
        config.gradient
      )}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            {poly.name}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-black/20 px-5 py-2 rounded-full backdrop-blur-sm">
          <Users className="h-5 w-5 text-white/80" />
          <span className="text-xl font-bold text-white">{activeCount}</span>
          <span className="text-white/60 font-medium">{t("queue:labels.queue")}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col gap-5">
        {/* Currently Being Served - THE HERO */}
        <div className={cn(cardShell, "flex-1 p-7 grid grid-cols-[1fr_auto] items-center gap-8") }>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  "inline-flex h-3 w-3 rounded-full transition-colors duration-300 motion-reduce:transition-none",
                  inConsultation ? "bg-emerald-400" : "bg-slate-600"
                )}
              />
              <p className={cn(labelClass, inConsultation ? config.accentLight : "text-slate-500")}>
                {t("queue:labels.activeService")}
              </p>
            </div>
            {inConsultation ? (
              <>
                <p className="text-[clamp(2.25rem,3.7vw,4.6rem)] font-black text-white leading-[1.02] break-words line-clamp-2">
                  {inConsultation.patient?.patient_name || "-"}
                </p>
                <p className="mt-3 text-base font-medium uppercase tracking-[0.1em] text-slate-300">
                  {t("queue:labels.activeQueueNumber")}
                </p>
              </>
            ) : (
              <p className="text-[clamp(1.9rem,2.8vw,3.2rem)] font-medium text-slate-500 italic">{t("queue:labels.waitingPatient")}</p>
            )}
          </div>

          <div className="text-right pl-6 border-l border-slate-700/70">
            <p className="text-[clamp(5.6rem,9.4vw,9.4rem)] leading-none font-black tabular-nums tracking-tight text-white">
              {formatQueueNumber(inConsultation?.queue?.queue_number)}
            </p>
          </div>
        </div>

        {/* Anamnesa */}
        <div className={cn(cardShell, "grid grid-cols-[1fr_auto] items-center p-5 border-amber-600/45 bg-amber-950/20") }>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-300 transition-opacity duration-300 motion-reduce:transition-none" />
              <p className={cn(labelClass, "text-amber-300/85")}>{t("queue:labels.inAnamnesis")}</p>
            </div>
            {inAnamnesa ? (
              <p className="text-[clamp(1.75rem,2.6vw,2.8rem)] font-bold text-white truncate">
                {inAnamnesa.patient?.patient_name || "-"}
              </p>
            ) : (
              <p className="text-[clamp(1.4rem,2.1vw,2.2rem)] text-slate-500 italic">{t("common:states.empty")}</p>
            )}
          </div>

          <div className="text-right pl-5 border-l border-amber-700/40">
            <p className="text-[clamp(3.2rem,6vw,5.2rem)] leading-none font-black text-amber-200 tabular-nums tracking-tight">
              {formatQueueNumber(inAnamnesa?.queue?.queue_number)}
            </p>
          </div>
        </div>

        {/* Waiting Queue */}
        <div className={cn(cardShell, "p-4") }>
          <div className="flex items-center justify-between mb-4">
            <p className={cn(labelClass, "text-slate-400 flex items-center gap-2") }>
              <Users className="h-4 w-4" /> {t("queue:labels.waitingQueue")}
            </p>
            <span className="text-sm font-semibold text-slate-200 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700/80 tabular-nums">
              {t("queue:labels.queuedCount", { count: waitingQueue.length })}
            </span>
          </div>
          
          {waitingQueue.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-slate-700/70 rounded-lg">
              <p className="text-lg text-slate-500 font-medium">{t("queue:labels.noQueue")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {waitingQueue.slice(0, 8).map((r, i) => (
                <div
                  key={r.id}
                  className={cn(
                    "relative min-w-0 flex flex-col items-center justify-center px-2 py-4 rounded-lg border transition-colors duration-200 motion-reduce:transition-none",
                    i === 0
                      ? "bg-amber-900/35 border-amber-400/65"
                      : "bg-slate-800/80 border-slate-700/95"
                  )}
                >
                  {i === 0 && (
                    <span className="absolute top-1 right-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-200">
                      {t("queue:labels.next")}
                    </span>
                  )}
                  <span className={cn(
                    "text-[clamp(2.2rem,3.2vw,3.2rem)] leading-none font-black tabular-nums",
                    i === 0 ? "text-amber-100" : "text-slate-100"
                  )}>
                    {formatQueueNumber(r.queue?.queue_number)}
                  </span>
                  <span className={cn(
                    "text-sm font-medium truncate max-w-full mt-1",
                    i === 0 ? "text-amber-200/90" : "text-slate-300"
                  )}>
                    {r.patient?.patient_name?.split(" ")[0] || "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {waitingQueue.length > 8 && (
            <p className="text-center text-sm text-slate-500 mt-4 font-medium">
              {t("queue:labels.moreInQueue", { count: waitingQueue.length - 8 })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
