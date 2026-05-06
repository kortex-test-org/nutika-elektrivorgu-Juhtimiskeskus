import { create } from "zustand"
import { persist } from "zustand/middleware"

export const LOCALES = ["et", "en", "ru"] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_TO_BCP47: Record<Locale, string> = {
  et: "et-EE",
  en: "en-GB",
  ru: "ru-RU",
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "et",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "smartgrid-locale" },
  ),
)
