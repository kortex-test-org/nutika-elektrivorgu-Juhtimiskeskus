import { hash, verify } from "@node-rs/argon2"
import { getUserByEmail, getUserById, getUserCount, insertUser } from "../../db/repository/user"

export const registerUser = async (email: string, password: string) => {
  const existing = await getUserByEmail(email)
  if (existing) {
    throw new Error("Email already in use")
  }

  const count = await getUserCount()
  const role = count === 0 ? "master" : "user"

  const passwordHash = await hash(password)
  const user = await insertUser({ email, passwordHash, role })

  if (!user) throw new Error("Failed to create user")

  return { id: user.id, email: user.email, role: user.role }
}

export const loginUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email)

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

  return { id: user.id, email: user.email, role: user.role }
}

export const getCurrentUser = async (userId: string) => {
  const user = await getUserById(userId)
  if (!user) throw new Error("User not found")

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }
}
