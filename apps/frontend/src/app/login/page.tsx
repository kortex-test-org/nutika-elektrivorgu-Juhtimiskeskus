import { Suspense } from "react"
import { LoginForm } from "@/components/organisms/LoginForm"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
