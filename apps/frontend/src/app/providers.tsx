"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Navbar } from "@/components/organisms/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { queryClient } from "@/lib/queryClient"
import { useLocaleStore } from "@/stores/localeStore"
import enMessages from "../../messages/en.json"
import etMessages from "../../messages/et.json"
import ruMessages from "../../messages/ru.json"

const ALL_MESSAGES = { et: etMessages, en: enMessages, ru: ruMessages }

export function Providers({ children }: { children: ReactNode }) {
  const { locale } = useLocaleStore()

  return (
    <NextIntlClientProvider locale={locale} messages={ALL_MESSAGES[locale]}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <Navbar />
          {children}
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
