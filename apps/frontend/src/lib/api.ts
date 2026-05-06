import { useAuthStore } from "@/stores/authStore"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...authHeader, ...options?.headers },
    ...options,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Request failed" }))) as {
      error: string
    }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...init }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...init }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body), ...init }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "DELETE", ...init }),
}
