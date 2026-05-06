import { PGlite } from "@electric-sql/pglite"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import * as schema from "./schema"

const isPg = Boolean(process.env.DATABASE_URL)

const pgliteClient = isPg ? null : new PGlite("./local.db")

export const db = isPg
  ? drizzlePg(process.env.DATABASE_URL as string, { schema })
  : drizzle(pgliteClient as PGlite, { schema })

export async function runMigrations(migrationsFolder: string) {
  if (isPg) {
    await migratePg(drizzlePg(process.env.DATABASE_URL as string), { migrationsFolder })
  } else {
    await migrate(drizzle(pgliteClient as PGlite), { migrationsFolder })
  }
}
