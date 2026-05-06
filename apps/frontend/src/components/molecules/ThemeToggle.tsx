"use client"

import { Moon, Sun, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEME_ICON: Record<string, React.ReactNode> = {
  system: <SunMoon className="h-3.5 w-3.5" />,
  light: <Sun className="h-3.5 w-3.5" />,
  dark: <Moon className="h-3.5 w-3.5" />,
}

const THEME_LABEL: Record<string, string> = {
  system: "Süsteem",
  light: "Hele",
  dark: "Tume",
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const currentTheme = theme ?? "system"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title={mounted ? `Teema: ${currentTheme}` : "Teema"}
        >
          {mounted ? THEME_ICON[currentTheme] : <SunMoon className="h-3.5 w-3.5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["light", "dark", "system"] as const).map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => setTheme(option)}
            className={currentTheme === option ? "bg-muted font-medium" : ""}
          >
            <span className="mr-2">{THEME_ICON[option]}</span>
            {THEME_LABEL[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
