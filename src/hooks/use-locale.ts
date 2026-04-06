import { useTranslation } from "react-i18next"
import { normalizeLanguage, type AppLanguage } from "@/lib/i18n/config"
import { useLocaleStore } from "@/stores"

export function useLocale() {
  const { i18n } = useTranslation()
  const language = useLocaleStore((state) => state.language)
  const setLanguage = useLocaleStore((state) => state.setLanguage)

  const changeLanguage = async (nextLanguage: string) => {
    const normalized = normalizeLanguage(nextLanguage)
    setLanguage(normalized)
    await i18n.changeLanguage(normalized)
  }

  return {
    language: normalizeLanguage(language) as AppLanguage,
    changeLanguage,
  }
}
