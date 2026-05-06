type LogLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL"

const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }
  process.stdout.write(JSON.stringify(entry) + "\n")
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log("INFO", message, context),
  warning: (message: string, context?: Record<string, unknown>) =>
    log("WARNING", message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    log("ERROR", message, context),
  critical: (message: string, context?: Record<string, unknown>) =>
    log("CRITICAL", message, context),
}
