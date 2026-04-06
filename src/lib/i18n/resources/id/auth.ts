const authId = {
  login: {
    title: "Klinik Aulia Sehat",
    description: "Masuk ke sistem antrean",
    username: "Username",
    password: "Password",
    usernamePlaceholder: "Masukkan username...",
    passwordPlaceholder: "Masukkan password...",
    submit: "Masuk",
    success: "Login berhasil",
    failed: "Login gagal",
  },
  validation: {
    usernameRequired: "Username wajib diisi",
    passwordRequired: "Password wajib diisi",
  },
} as const

export default authId
