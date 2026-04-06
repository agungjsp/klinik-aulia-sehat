const errorsEn = {
  forbidden: {
    title: "403",
    description: "Access denied",
  },
  notFound: {
    title: "404",
    description: "Page not found",
  },
  noAccess: {
    icon: "⚠️",
    title: "Account has no access",
    description: "Please contact the administrator",
  },
  validation: {
    required: "{{field}} is required",
    minLength: "{{field}} must be at least {{min}} characters",
    email: "Invalid email",
    url: "Invalid URL",
    mismatch: "{{field}} does not match",
    minValue: "{{field}} must be at least {{min}}",
    greaterThan: "{{field}} must be greater than {{other}}",
  },
} as const

export default errorsEn
