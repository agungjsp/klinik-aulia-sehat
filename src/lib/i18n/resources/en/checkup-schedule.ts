const checkupScheduleEn = {
  page: {
    title: "Checkup Schedule",
    addSchedule: "Add Schedule",
    searchPlaceholder: "Search schedules...",
  },
  table: {
    patient: "Patient",
    poly: "Clinic",
    date: "Date",
    description: "Description",
    actions: "Actions",
    empty: "No data",
    editAria: "Edit schedule {{id}}",
    deleteAria: "Delete schedule {{id}}",
  },
  form: {
    addTitle: "Add Checkup Schedule",
    editTitle: "Edit Checkup Schedule",
    patientName: "Patient Name",
    patientPlaceholder: "Search patient name...",
    poly: "Clinic",
    polyPlaceholder: "Select target clinic",
    date: "Checkup Date",
    noteOptional: "Notes (optional)",
    notePlaceholder: "Example: Blood pressure check, review lab result, etc.",
    add: "Add",
  },
  confirmDelete: {
    title: "Delete Schedule",
    description: "Are you sure you want to delete this schedule?",
  },
  toasts: {
    updated: "Checkup schedule updated successfully",
    added: "Checkup schedule added successfully",
    deleted: "Checkup schedule deleted successfully",
  },
  validation: {
    patientRequired: "Patient is required",
    patientNameRequired: "Patient name is required",
    polyRequired: "Clinic is required",
    dateRequired: "Date is required",
  },
} as const

export default checkupScheduleEn
