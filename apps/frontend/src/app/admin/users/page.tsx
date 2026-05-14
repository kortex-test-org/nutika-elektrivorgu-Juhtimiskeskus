"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import type { CreateUserDto } from "@smartgrid/shared"
import { CreateUserSchema } from "@smartgrid/shared"
import { Plus, Trash2, UserX } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <span className="text-destructive text-xs">{errors.email.message as string}</span>
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: users, isLoading, error } = useUsers()
  const deleteMutation = useDeleteUser()
  const deactivateMutation = useDeactivateUser()
  const { toast } = useToast()

  const handleDelete = (id: string, email: string) => {
    if (!confirm(t("confirmDelete", { email }))) return
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
                <TableHead>{t("email")}</TableHead>
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
                  <TableCell className="font-medium">{user.email}</TableCell>
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
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
