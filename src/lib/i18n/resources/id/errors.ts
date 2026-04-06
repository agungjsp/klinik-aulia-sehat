const errorsId = {
  forbidden: {
    title: "403",
    description: "Akses ditolak",
  },
  notFound: {
    title: "404",
    description: "Halaman tidak ditemukan",
  },
  noAccess: {
    icon: "⚠️",
    title: "Akun tidak memiliki akses",
    description: "Silakan hubungi administrator",
  },
  validation: {
    required: "{{field}} wajib diisi",
    minLength: "{{field}} minimal {{min}} karakter",
    email: "Email tidak valid",
    url: "URL tidak valid",
    mismatch: "{{field}} tidak sama",
    minValue: "{{field}} minimal {{min}}",
    greaterThan: "{{field}} harus lebih besar dari {{other}}",
  },
} as const

export default errorsId
