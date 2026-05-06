import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  role: "master" | "user"
  isActive: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "auth_token=; path=/; max-age=0"
        }
        set({ user: null, token: null })
      },
    }),
    { name: "auth-store" },
  ),
)
