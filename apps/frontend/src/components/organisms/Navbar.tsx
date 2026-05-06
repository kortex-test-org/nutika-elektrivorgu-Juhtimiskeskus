"use client"

import { LogOut, Menu, X, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/molecules/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"

interface NavLinkProps {
  href: string
  exact?: boolean
  children: React.ReactNode
}

function NavLink({ href, exact = false, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={`text-sm transition-colors px-3 py-1.5 rounded-md ${
        isActive
          ? "text-foreground font-medium bg-muted"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menu on every navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    router.push("/login")
  }

  if (!user) return null

  const themeButton = <ThemeToggle />

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 flex items-center h-14 gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-violet-500 dark:text-violet-400 shrink-0"
        >
          <Zap className="h-4 w-4" />
          SmartGrid
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-[840px]:flex items-center gap-1 flex-1">
          <NavLink href="/" exact>
            Avaleht
          </NavLink>
          <NavLink href="/devices">Seadmed</NavLink>
          <NavLink href="/forecast">Prognoos</NavLink>
          <NavLink href="/savings">Sääst</NavLink>
          {user.role === "master" && <NavLink href="/admin/users">Admin</NavLink>}
        </nav>

        {/* Desktop actions */}
        <div className="hidden min-[840px]:flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground mr-1">{user.email}</span>
          {themeButton}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Välju
          </Button>
        </div>

        {/* Burger button — always on the right on mobile */}
        <Button
          size="sm"
          variant="ghost"
          className="min-[840px]:hidden h-8 w-8 p-0 ml-auto"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Menüü"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu — absolute so it overlays page content */}
      {mobileOpen && (
        <nav className="min-[840px]:hidden absolute left-0 right-0 top-14 z-50 border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
          <NavLink href="/" exact>
            Avaleht
          </NavLink>
          <NavLink href="/devices">Seadmed</NavLink>
          <NavLink href="/forecast">Prognoos</NavLink>
          <NavLink href="/savings">Sääst</NavLink>
          {user.role === "master" && <NavLink href="/admin/users">Admin</NavLink>}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <div className="flex items-center gap-1">
              {themeButton}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Välju
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
