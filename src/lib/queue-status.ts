import type { QueueStatus } from "@/types"

export const QUEUE_STATUS_CONFIG: Record<QueueStatus, { 
  label: string
  color: string
  bgColor: string
  variant: "default" | "secondary" | "outline" | "destructive"
}> = {
  CHECKED_IN: { label: "Menunggu Anamnesa", color: "text-blue-700", bgColor: "bg-blue-100", variant: "default" },
  IN_ANAMNESA: { label: "Sedang Anamnesa", color: "text-orange-700", bgColor: "bg-orange-100", variant: "secondary" },
  WAITING_DOCTOR: { label: "Menunggu Dokter", color: "text-purple-700", bgColor: "bg-purple-100", variant: "secondary" },
  IN_CONSULTATION: { label: "Sedang Konsultasi", color: "text-yellow-700", bgColor: "bg-yellow-100", variant: "secondary" },
  DONE: { label: "Selesai", color: "text-green-700", bgColor: "bg-green-100", variant: "outline" },
  NO_SHOW: { label: "Tidak Hadir", color: "text-gray-700", bgColor: "bg-gray-200", variant: "destructive" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-700", bgColor: "bg-red-100", variant: "destructive" },
}

export const getQueueStatusLabel = (status: QueueStatus) => QUEUE_STATUS_CONFIG[status].label
