import { users } from "@smartgrid/shared"
import { db } from "@smartgrid/shared/db"
import { eq } from "drizzle-orm"

export const getUserByEmail = async (email: string) => {
  return db.query.users.findFirst({ where: eq(users.email, email) })
}

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) })
}

export const getAllUsers = async () => {
  return db.select().from(users)
}

export const getUserCount = async () => {
  const result = await db.select().from(users)
  return result.length
}

export const insertUser = async (data: { email: string; passwordHash: string; role: string }) => {
  const result = await db.insert(users).values(data).returning()
  return result[0]
}

export const updateUser = async (
  id: string,
  data: Partial<{
    email: string
    passwordHash: string
    role: string
    isActive: boolean
  }>,
) => {
  const result = await db.update(users).set(data).where(eq(users.id, id)).returning()
  return result[0]
}

export const deleteUser = async (id: string) => {
  await db.delete(users).where(eq(users.id, id))
}
