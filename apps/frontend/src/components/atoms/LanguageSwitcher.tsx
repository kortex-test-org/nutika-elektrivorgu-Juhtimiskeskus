"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALES, type Locale, useLocaleStore } from "@/stores/localeStore"

const LOCALE_LABEL: Record<Locale, string> = {
  et: "Eesti",
  en: "English",
  ru: "Русский",
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-muted-foreground hover:text-foreground text-xs uppercase font-medium"
        >
          {locale}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => setLocale(option)}
            className={locale === option ? "bg-muted font-medium" : ""}
          >
            {LOCALE_LABEL[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
