const patientId = {
  page: {
    title: "Master Pasien",
    description: "Data pasien klinik (dari reservasi)",
  },
  table: {
    name: "Nama",
    bpjsNumber: "No. BPJS",
    whatsappNumber: "No. WhatsApp",
    email: "Email",
    actions: "Aksi",
    empty: "Tidak ada data pasien",
    editAria: "Edit pasien {{name}}",
  },
  form: {
    editTitle: "Edit Pasien",
    fullName: "Nama Lengkap",
    fullNameHint: "Gunakan nama legal pasien untuk konsistensi data rekam medis.",
    whatsappNumber: "No. WhatsApp",
    whatsappPlaceholder: "08xxxxxxxxxx",
    whatsappHint: "Nomor ini dipakai untuk notifikasi antrean dan pengingat kontrol.",
    bpjsOptional: "No. BPJS (opsional)",
    bpjsPlaceholder: "Nomor kartu BPJS",
    emailOptional: "Email (opsional)",
    emailPlaceholder: "email@example.com",
  },
  confirmSubmit: {
    title: "Simpan Perubahan Data Pasien",
    description: "Terapkan perubahan data pasien ini sekarang?",
    impact1: "Data pasien ini akan digunakan pada antrean dan notifikasi berikutnya.",
    impact2: "Pastikan kontak dan nomor BPJS sudah benar sebelum menyimpan.",
  },
  toasts: {
    updated: "Data pasien berhasil diperbarui",
  },
  validation: {
    nameRequired: "Nama wajib diisi",
    whatsappMin: "No. WhatsApp minimal 10 digit",
    emailInvalid: "Email tidak valid",
  },
} as const

export default patientId
