const patientEn = {
  page: {
    title: "Patient Master",
    description: "Clinic patient data (from reservations)",
  },
  table: {
    name: "Name",
    bpjsNumber: "BPJS No.",
    whatsappNumber: "WhatsApp No.",
    email: "Email",
    actions: "Actions",
    empty: "No patient data",
    editAria: "Edit patient {{name}}",
  },
  form: {
    editTitle: "Edit Patient",
    fullName: "Full Name",
    fullNameHint: "Use the patient's legal name for medical record consistency.",
    whatsappNumber: "WhatsApp No.",
    whatsappPlaceholder: "08xxxxxxxxxx",
    whatsappHint: "This number is used for queue notifications and follow-up reminders.",
    bpjsOptional: "BPJS No. (optional)",
    bpjsPlaceholder: "BPJS card number",
    emailOptional: "Email (optional)",
    emailPlaceholder: "email@example.com",
  },
  confirmSubmit: {
    title: "Save Patient Data Changes",
    description: "Apply these patient data changes now?",
    impact1: "This patient data will be used in subsequent queues and notifications.",
    impact2: "Make sure contact info and BPJS number are correct before saving.",
  },
  toasts: {
    updated: "Patient data updated successfully",
  },
  validation: {
    nameRequired: "Name is required",
    whatsappMin: "WhatsApp number must be at least 10 digits",
    emailInvalid: "Invalid email",
  },
} as const

export default patientEn
