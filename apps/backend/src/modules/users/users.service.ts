import { hash } from "@node-rs/argon2"
import {
  deleteUser,
  getAllUsers,
  getUserById,
  insertUser,
  updateUser,
} from "../../db/repository/user"

export const listUsers = async () => {
  return getAllUsers()
}

export const createUser = async (email: string, password: string, role = "user") => {
  const passwordHash = await hash(password)
  const user = await insertUser({ email, passwordHash, role })
  if (!user) throw new Error("Failed to create user")
  return { id: user.id, email: user.email, role: user.role }
}

export const patchUser = async (
  id: string,
  data: Partial<{
    email: string
    password: string
    role: string
    isActive: boolean
  }>,
) => {
  const user = await getUserById(id)
  if (!user) throw new Error("User not found")

  const updateData: Parameters<typeof updateUser>[1] = {}

  if (data.email) updateData.email = data.email
  if (data.password) updateData.passwordHash = await hash(data.password)
  if (data.role) updateData.role = data.role
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const updated = await updateUser(id, updateData)
  return updated
}

export const removeUser = async (id: string) => {
  const user = await getUserById(id)
  if (!user) throw new Error("User not found")
  await deleteUser(id)
}

export const deactivateUser = async (id: string) => {
  const user = await getUserById(id)
  if (!user) throw new Error("User not found")
  return updateUser(id, { isActive: false })
}
