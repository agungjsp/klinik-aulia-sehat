const dashboardId = {
  page: {
    title: "Dashboard",
  },
  summary: {
    totalQueue: "Total Antrean",
    totalPatients: "Total Pasien",
    completed: "Selesai",
    noShow: "Tidak Hadir",
  },
  trend: {
    title: "Tren Reservasi",
    monthlyDescription: "Jumlah reservasi harian bulan {{month}} {{year}}",
    yearlyDescription: "Jumlah reservasi bulanan tahun {{year}}",
    emptyTitle: "Tidak ada data reservasi",
    emptyMonth: "untuk bulan {{month}} {{year}}",
    emptyYear: "untuk tahun {{year}}",
    tooltipCount: "{{count}} Reservasi",
    tooltipMore: "+ {{count}} lainnya",
  },
  byPoly: {
    title: "Distribusi per Poli",
    description: "Jumlah reservasi per poli",
    empty: "Tidak ada data",
    tooltipCount: "{{count}} Reservasi",
  },
  attendance: {
    title: "Kehadiran Pasien",
    description: "Rasio kehadiran",
    empty: "Tidak ada data",
    rate: "Tingkat Kehadiran",
    attended: "Hadir",
    notAttended: "Tidak Hadir",
    total: "Total",
  },
  waitingTime: {
    title: "Waktu Tunggu Rata-rata",
    description: "Per poli",
    empty: "Tidak ada data",
  },
  peakHours: {
    title: "Jam Sibuk",
    description: "Hari ini",
    empty: "Tidak ada data",
    tooltipHour: "Pukul {{label}}",
    tooltipCount: "{{count}} Reservasi",
  },
  bpjsVsGeneral: {
    title: "BPJS vs Umum",
    description: "Perbandingan jumlah pasien BPJS dan Umum",
    empty: "Tidak ada data",
    bpjs: "BPJS",
    general: "Umum",
  },
} as const

export default dashboardId
