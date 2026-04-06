const authEn = {
  login: {
    title: "Aulia Sehat Clinic",
    description: "Sign in to the queue system",
    username: "Username",
    password: "Password",
    usernamePlaceholder: "Enter username...",
    passwordPlaceholder: "Enter password...",
    submit: "Sign in",
    success: "Login successful",
    failed: "Login failed",
  },
  validation: {
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
  },
} as const

export default authEn
