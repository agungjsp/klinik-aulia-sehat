import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import { DEFAULT_LANGUAGE, normalizeLanguage } from "@/lib/i18n/config"
import { resources } from "@/lib/i18n/resources"

const FALLBACK_NS = "common"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    lng: DEFAULT_LANGUAGE,
    ns: [
      "common",
      "auth",
      "nav",
      "errors",
      "queue",
      "language",
      "adminQueue",
      "reports",
      "schedule",
      "doctorQueue",
      "reminderConfig",
      "checkupSchedule",
      "master",
      "dashboard",
      "settings",
      "patient",
      "nurseQueue",
    ],
    defaultNS: FALLBACK_NS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
      convertDetectedLanguage: (lng: string) => normalizeLanguage(lng),
    },
  })

export default i18n
