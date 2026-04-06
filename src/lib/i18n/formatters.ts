import { format } from "date-fns"
import { getLocaleByLanguage } from "@/lib/i18n/date-locale"

export function formatDateByLanguage(date: Date, formatString: string, language?: string | null) {
  const { dateFnsLocale } = getLocaleByLanguage(language)
  return format(date, formatString, { locale: dateFnsLocale })
}
