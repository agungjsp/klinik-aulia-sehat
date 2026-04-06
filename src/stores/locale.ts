import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_LANGUAGE, normalizeLanguage, type AppLanguage } from "@/lib/i18n/config"

interface LocaleState {
  language: AppLanguage
  setLanguage: (language: string) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language: normalizeLanguage(language) }),
    }),
    {
      name: "app-locale-storage",
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
)
