import { Suspense } from "react"
import { ThemeToggle } from "@/components/molecules/ThemeToggle"
import { LoginForm } from "@/components/organisms/LoginForm"

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute top-3 right-4">
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
