"use client"

import { LogOut, Moon, Sun, SunMoon, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"

const THEME_CYCLE: Record<string, string> = {
  system: "light",
  light: "dark",
  dark: "system",
}

const THEME_ICON: Record<string, React.ReactNode> = {
  system: <SunMoon className="h-3.5 w-3.5" />,
  light: <Sun className="h-3.5 w-3.5" />,
  dark: <Moon className="h-3.5 w-3.5" />,
}

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
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  const currentTheme = theme ?? "system"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-violet-500 dark:text-violet-400 mr-4"
          >
            <Zap className="h-4 w-4" />
            SmartGrid
          </Link>
          <NavLink href="/" exact>
            Avaleht
          </NavLink>
          <NavLink href="/devices">Seadmed</NavLink>
          <NavLink href="/forecast">Prognoos</NavLink>
          <NavLink href="/savings">Sääst</NavLink>
          {user.role === "master" && <NavLink href="/admin/users">Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">{user.email}</span>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTheme(THEME_CYCLE[currentTheme] ?? "system")}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title={`Teema: ${currentTheme}`}
          >
            {THEME_ICON[currentTheme]}
          </Button>

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
      </div>
    </header>
  )
}
