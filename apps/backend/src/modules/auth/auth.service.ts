import { hash, verify } from "@node-rs/argon2"
import {
  getUserById,
  getUserByUsername,
  getUserCount,
  insertUser,
  updateUser,
} from "../../db/repository/user"

export const registerUser = async (username: string, password: string) => {
  const existing = await getUserByUsername(username)
  if (existing) {
    throw new Error("Username already in use")
  }

  const count = await getUserCount()
  const role = count === 0 ? "master" : "user"

  const passwordHash = await hash(password)
  const user = await insertUser({ username, passwordHash, role })

  if (!user) throw new Error("Failed to create user")

  return { id: user.id, username: user.username, role: user.role }
}

export const loginUser = async (username: string, password: string) => {
  const user = await getUserByUsername(username)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated")
  }

  const passwordValid = await verify(user.passwordHash, password)
  if (!passwordValid) {
    throw new Error("Invalid credentials")
  }

  return { id: user.id, username: user.username, role: user.role }
}

export const getCurrentUser = async (userId: string) => {
  const user = await getUserById(userId)
  if (!user) throw new Error("User not found")

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }
}

export const updateCurrentUser = async (
  userId: string,
  data: { username?: string; password?: string },
) => {
  const user = await getUserById(userId)
  if (!user) throw new Error("User not found")

  const updateData: Parameters<typeof updateUser>[1] = {}
  if (data.username) {
    const existing = await getUserByUsername(data.username)
    if (existing && existing.id !== userId) {
      throw new Error("Username already in use")
    }
    updateData.username = data.username
  }
  if (data.password) {
    updateData.passwordHash = await hash(data.password)
  }

  const updated = await updateUser(userId, updateData)
  if (!updated) throw new Error("Failed to update user")

  return { id: updated.id, username: updated.username, role: updated.role }
}
