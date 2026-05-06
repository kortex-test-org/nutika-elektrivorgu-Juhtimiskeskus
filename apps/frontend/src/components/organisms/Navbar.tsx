"use client"

import { LogOut, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#07070f]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-violet-400 mr-4"
          >
            <Zap className="h-4 w-4" />
            SmartGrid
          </Link>
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            Avaleht
          </Link>
          <Link
            href="/devices"
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            Seadmed
          </Link>
          <Link
            href="/forecast"
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            Prognoos
          </Link>
          <Link
            href="/savings"
            className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            Sääst
          </Link>
          {user.role === "master" && (
            <Link
              href="/admin/users"
              className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs text-white/35">{user.email}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="gap-1.5 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Välju
          </Button>
        </div>
      </div>
    </header>
  )
}
