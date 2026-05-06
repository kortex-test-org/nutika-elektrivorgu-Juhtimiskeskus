"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { LoginDto } from "@smartgrid/shared"
import { LoginSchema } from "@smartgrid/shared"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"

interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: "master" | "user"
    isActive: boolean
  }
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: typeboxResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginDto) => {
    try {
      const result = await api.post<LoginResponse>("/api/auth/login", data)
      setUser(result.user)
      setToken(result.token)
      document.cookie = `auth_token=${result.token}; path=/; SameSite=Strict`
      const from = searchParams.get("from") ?? "/"
      router.push(from)
    } catch (err) {
      toast({
        title: "Sisselogimine ebaõnnestus",
        description: err instanceof Error ? err.message : "Vale e-post või salasõna",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sisselogimine</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-destructive text-xs">{errors.email.message as string}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Salasõna</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <span className="text-destructive text-xs">{errors.password.message as string}</span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sisselogimine..." : "Logi sisse"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
