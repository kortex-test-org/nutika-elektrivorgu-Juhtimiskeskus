import type { CreateUserDto, UpdateUserDto } from "@smartgrid/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/api/users"),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserDto) => api.post<User>("/api/users", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserDto) => api.patch<User>(`/api/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch<User>(`/api/users/${id}/deactivate`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}
