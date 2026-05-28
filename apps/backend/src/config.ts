const REQUIRED_ENV_VARS = ["JWT_SECRET"] as const

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key] && process.env.NODE_ENV !== "test") {
    throw new Error(`Missing required env variable: ${key}`)
  }
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: (process.env.JWT_SECRET || "test-secret-key-for-unit-testing-purposes") as string,
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV ?? "development",
}
