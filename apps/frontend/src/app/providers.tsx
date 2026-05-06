"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Navbar } from "@/components/organisms/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { queryClient } from "@/lib/queryClient"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
