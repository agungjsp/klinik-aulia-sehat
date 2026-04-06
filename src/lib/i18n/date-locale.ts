import type { Locale } from "date-fns"
import { enUS, id } from "date-fns/locale"
import { normalizeLanguage, type AppLanguage } from "@/lib/i18n/config"

interface LocaleMapValue {
  appLanguage: AppLanguage
  dateFnsLocale: Locale
  intlLocale: string
}

const localeMap: Record<AppLanguage, LocaleMapValue> = {
  id: {
    appLanguage: "id",
    dateFnsLocale: id,
    intlLocale: "id-ID",
  },
  en: {
    appLanguage: "en",
    dateFnsLocale: enUS,
    intlLocale: "en-US",
  },
}

export function getLocaleByLanguage(language?: string | null): LocaleMapValue {
  const normalized = normalizeLanguage(language)
  return localeMap[normalized]
}
