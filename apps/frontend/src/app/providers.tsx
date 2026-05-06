"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { Navbar } from "@/components/organisms/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { queryClient } from "@/lib/queryClient"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
