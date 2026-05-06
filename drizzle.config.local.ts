import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./packages/shared/src/schema.ts",
  out: "./drizzle-local",
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: "./local.db",
  },
})
