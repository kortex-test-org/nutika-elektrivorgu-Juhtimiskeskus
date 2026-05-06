import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

export const db = process.env.DATABASE_URL
  ? drizzlePg(process.env.DATABASE_URL, { schema })
  : drizzle(new PGlite("./local.db"), { schema })
