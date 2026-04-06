const dashboardEn = {
  page: {
    title: "Dashboard",
  },
  summary: {
    totalQueue: "Total Queue",
    totalPatients: "Total Patients",
    completed: "Completed",
    noShow: "No Show",
  },
  trend: {
    title: "Reservation Trend",
    monthlyDescription: "Daily reservations in {{month}} {{year}}",
    yearlyDescription: "Monthly reservations in {{year}}",
    emptyTitle: "No reservation data",
    emptyMonth: "for {{month}} {{year}}",
    emptyYear: "for year {{year}}",
    tooltipCount: "{{count}} Reservations",
    tooltipMore: "+ {{count}} more",
  },
  byPoly: {
    title: "Distribution by Clinic",
    description: "Reservation count per clinic",
    empty: "No data",
    tooltipCount: "{{count}} Reservations",
  },
  attendance: {
    title: "Patient Attendance",
    description: "Attendance ratio",
    empty: "No data",
    rate: "Attendance Rate",
    attended: "Attended",
    notAttended: "Not Attended",
    total: "Total",
  },
  waitingTime: {
    title: "Average Waiting Time",
    description: "Per clinic",
    empty: "No data",
  },
  peakHours: {
    title: "Peak Hours",
    description: "Today",
    empty: "No data",
    tooltipHour: "Hour {{label}}",
    tooltipCount: "{{count}} Reservations",
  },
  bpjsVsGeneral: {
    title: "BPJS vs General",
    description: "Comparison of BPJS and General patient counts",
    empty: "No data",
    bpjs: "BPJS",
    general: "General",
  },
} as const

export default dashboardEn
