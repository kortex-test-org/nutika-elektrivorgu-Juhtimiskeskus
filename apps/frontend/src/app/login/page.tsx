"use client"

import { useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { LanguageSwitcher } from "@/components/atoms/LanguageSwitcher"
import { ThemeToggle } from "@/components/molecules/ThemeToggle"
import { LoginForm } from "@/components/organisms/LoginForm"
import { useAuthStore } from "@/stores/authStore"

export default function LoginPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) {
      router.replace("/")
    }
  }, [token, router])

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute top-3 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
