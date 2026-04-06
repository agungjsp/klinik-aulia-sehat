const reminderConfigEn = {
  page: {
    title: "Reminder Configuration",
    addConfig: "Add Configuration",
  },
  table: {
    messageTemplate: "Message Template",
    offsetMinutes: "Offset (minutes)",
    patientCount: "Patient Count",
    type: "Type",
    actions: "Actions",
    empty: "No data",
    editAria: "Edit configuration {{id}}",
    deleteAria: "Delete configuration {{id}}",
  },
  tabs: {
    queue: "Queue",
    schedule: "Schedule",
  },
  form: {
    addTitle: "Add Configuration",
    editTitle: "Edit Configuration",
    messageTemplate: "Message Template",
    messageTemplatePlaceholder: "Select message template",
    reminderOffset: "Reminder Offset (minutes)",
    reminderOffsetPlaceholder: "Enter offset in minutes",
    patientCount: "Patient Count",
    patientCountPlaceholder: "Enter patient count",
    reminderType: "Reminder Type",
    reminderTypePlaceholder: "Select reminder type",
    add: "Add",
  },
  confirmDelete: {
    title: "Delete Configuration",
    description: "Are you sure you want to delete this configuration?",
    impact1: "Automatic reminders for this rule will stop running.",
    impact2: "Patients may not receive reminders from this configuration.",
    recoveryHint: "Delete only if this reminder rule is no longer needed.",
  },
  confirmSubmit: {
    editTitle: "Save Reminder Configuration",
    addTitle: "Add Reminder Configuration",
    editDescription: "Apply this reminder rule change now?",
    addDescription: "Activate this new reminder rule now?",
    impact1: "Reminder rule will be used for queue/checkup schedules based on type.",
    impact2: "Make sure offset and patient count match operational needs.",
  },
  toasts: {
    updated: "Reminder configuration updated successfully",
    added: "Reminder configuration added successfully",
    deleted: "Reminder configuration deleted successfully",
  },
  validation: {
    messageTemplateRequired: "Message template is required",
    offsetRequired: "Reminder offset is required",
    patientCountRequired: "Patient count is required",
    typeRequired: "Reminder type is required",
  },
} as const

export default reminderConfigEn
