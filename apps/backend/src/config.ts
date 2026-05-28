const REQUIRED_ENV_VARS = ["JWT_SECRET"] as const

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key] && process.env.NODE_ENV !== "test" && !process.env.CI) {
    console.warn(
      `⚠️ WARNING: Missing required env variable: ${key}. Using a fallback key. Please configure ${key} in production!`,
    )
  }
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: (process.env.JWT_SECRET || "change-me-in-production-fallback-key-secret") as string,
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV ?? "development",
}
