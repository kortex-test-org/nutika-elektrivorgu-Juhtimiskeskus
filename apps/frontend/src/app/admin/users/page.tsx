"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { CreateUserDto } from "@smartgrid/shared"
import { CreateUserSchema } from "@smartgrid/shared"
import { Plus, Trash2, UserX } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useCreateUser, useDeactivateUser, useDeleteUser, useUsers } from "@/hooks/useUsers"

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const t = useTranslations("admin")
  const createMutation = useCreateUser()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserDto>({
    resolver: typeboxResolver(CreateUserSchema),
  })

  const onSubmit = async (data: CreateUserDto) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        toast({ title: t("createSuccess") })
        reset()
        onOpenChange(false)
      },
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">{t("username")}</Label>
            <Input id="username" type="text" {...register("username")} />
            {errors.username && (
              <span className="text-destructive text-xs">{errors.username.message as string}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <span className="text-destructive text-xs">{errors.password.message as string}</span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {isSubmitting ? t("creating") : t("addUser")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const format = useFormatter()
  const router = useRouter()
  const { user } = useAuthStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: users, isLoading, error } = useUsers()
  const deleteMutation = useDeleteUser()
  const deactivateMutation = useDeactivateUser()
  const { toast } = useToast()

  useEffect(() => {
    if (user && user.role !== "master") {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-muted-foreground text-sm">
        {t("loading")}
      </div>
    )
  }

  if (user.role !== "master") {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 flex flex-col items-center justify-center gap-6 text-center animate-fade-up">
        <div className="w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="65" rx="20" ry="25" fill="#64748B" />
            <circle cx="50" cy="35" r="18" fill="#64748B" />
            <circle cx="43" cy="33" r="5" fill="#FFFFFF" />
            <circle cx="43" cy="33" r="2.5" fill="#1E293B" />
            <circle cx="57" cy="33" r="5" fill="#FFFFFF" />
            <circle cx="57" cy="33" r="2.5" fill="#1E293B" />
            <circle cx="50" cy="42" r="3" fill="#1E293B" />
            <polygon points="34,30 26,12 42,22" fill="#475569" />
            <polygon points="66,30 74,12 58,22" fill="#475569" />
            <circle cx="50" cy="75" r="8" fill="#FDA4AF" />
            <text x="46" y="79" fill="#1E293B" fontSize="10" fontWeight="bold">🛑</text>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-destructive">{t("insufficientPermissions")}</h1>
        <p className="text-muted-foreground max-w-md">{t("masterRoleRequired")}</p>
        <Button onClick={() => router.push("/")} className="gap-2">
          {t("backToHome")}
        </Button>
      </main>
    )
  }

  const handleDelete = (id: string, username: string) => {
    if (!confirm(t("confirmDelete", { username }))) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: t("deleteSuccess") }),
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  const handleDeactivate = (id: string) => {
    deactivateMutation.mutate(id, {
      onSuccess: () => toast({ title: t("deactivateSuccess") }),
      onError: (err) =>
        toast({ title: t("error"), description: err.message, variant: "destructive" }),
    })
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold w-fit heading-gradient">{t("title")}</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addUser")}
        </Button>
      </div>

      {isLoading && (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          {t("loading")}
        </div>
      )}
      {error && (
        <div className="text-destructive text-sm">
          {t("loadError")}: {error.message}
        </div>
      )}

      {users && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("username")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("noUsers")}
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "master" ? "default" : "secondary"}>
                      {user.role === "master" ? t("roleAdmin") : t("roleUser")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "outline"}>
                      {user.isActive ? t("active") : t("deactivated")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format.dateTime(new Date(user.createdAt), { dateStyle: "short" })}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== "master" ? (
                      <div className="flex gap-2 justify-end">
                        {user.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivate(user.id)}
                            disabled={deactivateMutation.isPending}
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic font-medium select-none cursor-default pr-2 inline-flex items-center gap-1">
                        🛡️ {t("roleAdmin")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  )
}
