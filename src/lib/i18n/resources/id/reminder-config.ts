const reminderConfigId = {
  page: {
    title: "Konfigurasi Pengingat",
    addConfig: "Tambah Konfigurasi",
  },
  table: {
    messageTemplate: "Template Pesan",
    offsetMinutes: "Offset (menit)",
    patientCount: "Jumlah Pasien",
    type: "Tipe",
    actions: "Aksi",
    empty: "Tidak ada data",
    editAria: "Edit konfigurasi {{id}}",
    deleteAria: "Hapus konfigurasi {{id}}",
  },
  tabs: {
    queue: "Antrean",
    schedule: "Jadwal",
  },
  form: {
    addTitle: "Tambah Konfigurasi",
    editTitle: "Edit Konfigurasi",
    messageTemplate: "Template Pesan",
    messageTemplatePlaceholder: "Pilih template pesan",
    reminderOffset: "Offset Pengingat (menit)",
    reminderOffsetPlaceholder: "Masukkan offset dalam menit",
    patientCount: "Jumlah Pasien",
    patientCountPlaceholder: "Masukkan jumlah pasien",
    reminderType: "Tipe Pengingat",
    reminderTypePlaceholder: "Pilih tipe pengingat",
    add: "Tambah",
  },
  confirmDelete: {
    title: "Hapus Konfigurasi",
    description: "Apakah Anda yakin ingin menghapus konfigurasi ini?",
    impact1: "Pengingat otomatis untuk aturan ini akan berhenti berjalan.",
    impact2: "Pasien dapat tidak menerima pengingat sesuai konfigurasi ini.",
    recoveryHint: "Gunakan hapus hanya jika aturan pengingat sudah tidak dibutuhkan.",
  },
  confirmSubmit: {
    editTitle: "Simpan Konfigurasi Pengingat",
    addTitle: "Tambah Konfigurasi Pengingat",
    editDescription: "Terapkan perubahan aturan pengingat ini sekarang?",
    addDescription: "Aktifkan aturan pengingat baru ini sekarang?",
    impact1: "Aturan pengingat akan dipakai pada jadwal antrean/kontrol sesuai tipe.",
    impact2: "Pastikan offset dan jumlah pasien sudah sesuai operasional.",
  },
  toasts: {
    updated: "Konfigurasi pengingat berhasil diperbarui",
    added: "Konfigurasi pengingat berhasil ditambahkan",
    deleted: "Konfigurasi pengingat berhasil dihapus",
  },
  validation: {
    messageTemplateRequired: "Template pesan wajib dipilih",
    offsetRequired: "Offset pengingat wajib diisi",
    patientCountRequired: "Jumlah pasien wajib diisi",
    typeRequired: "Tipe pengingat wajib diisi",
  },
} as const

export default reminderConfigId
