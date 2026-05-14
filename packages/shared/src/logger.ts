type LogLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL"

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
  magenta: "\x1b[35m",
}

const levelColors: Record<LogLevel, string> = {
  INFO: colors.green,
  WARNING: colors.yellow,
  ERROR: colors.red,
  CRITICAL: colors.magenta,
}

const isDev = process.env.NODE_ENV !== "production"

const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  if (isDev) {
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0]
    const color = levelColors[level] || colors.reset
    const contextStr =
      context && Object.keys(context).length > 0
        ? ` ${colors.gray}${JSON.stringify(context)}${colors.reset}`
        : ""

    process.stdout.write(
      `${colors.gray}[${timestamp}]${colors.reset} ${color}${level.padStart(8)}${colors.reset}: ${message}${contextStr}\n`,
    )
  } else {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    }
    process.stdout.write(JSON.stringify(entry) + "\n")
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("INFO", message, context),
  warning: (message: string, context?: Record<string, unknown>) => log("WARNING", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("ERROR", message, context),
  critical: (message: string, context?: Record<string, unknown>) =>
    log("CRITICAL", message, context),
}
