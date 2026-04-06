const checkupScheduleId = {
  page: {
    title: "Jadwal Kontrol",
    addSchedule: "Tambah Jadwal",
    searchPlaceholder: "Cari jadwal...",
  },
  table: {
    patient: "Pasien",
    poly: "Poli",
    date: "Tanggal",
    description: "Deskripsi",
    actions: "Aksi",
    empty: "Tidak ada data",
    editAria: "Edit jadwal {{id}}",
    deleteAria: "Hapus jadwal {{id}}",
  },
  form: {
    addTitle: "Tambah Jadwal Kontrol",
    editTitle: "Edit Jadwal Kontrol",
    patientName: "Nama Pasien",
    patientPlaceholder: "Cari nama pasien...",
    poly: "Poli",
    polyPlaceholder: "Pilih poli tujuan",
    date: "Tanggal Kontrol",
    noteOptional: "Keterangan (opsional)",
    notePlaceholder: "Contoh: Kontrol tekanan darah, cek hasil lab, dll.",
    add: "Tambah",
  },
  confirmDelete: {
    title: "Hapus Jadwal",
    description: "Apakah Anda yakin ingin menghapus jadwal ini?",
  },
  toasts: {
    updated: "Jadwal kontrol berhasil diperbarui",
    added: "Jadwal kontrol berhasil ditambahkan",
    deleted: "Jadwal kontrol berhasil dihapus",
  },
  validation: {
    patientRequired: "Pasien wajib dipilih",
    patientNameRequired: "Nama pasien wajib diisi",
    polyRequired: "Poli wajib dipilih",
    dateRequired: "Tanggal wajib diisi",
  },
} as const

export default checkupScheduleId
