export const SUPPORTED_LANGUAGES = ["id", "en"] as const

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: AppLanguage = "id"

export function normalizeLanguage(language?: string | null): AppLanguage {
  if (!language) {
    return DEFAULT_LANGUAGE
  }

  const normalized = language.toLowerCase()

  if (normalized.startsWith("en")) {
    return "en"
  }

  return "id"
}
