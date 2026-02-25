import fs from "node:fs";
import path from "node:path";
import colors from "colors/safe";

type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type LogLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "DEBUG" | "SECURITY" | "AUDIT";

type LogStats = {
  totalEntries: number;
  info: number;
  success: number;
  warning: number;
  error: number;
  security: number;
  audit: number;
  debug: number;
};

class Logger {
  private readonly logDir: string;
  private readonly logFile: string;

  constructor() {
    this.logDir = path.join(__dirname, "logs");
    this.createLogDirectory();
    this.logFile = path.join(this.logDir, `discord-checker-${this.getDateString()}.log`);
  }

  private createLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private safeStringify(data: unknown): string {
    const visited = new WeakSet<object>();

    try {
      return JSON.stringify(data, (_key, value: unknown) => {
        if (typeof value === "object" && value !== null) {
          if (visited.has(value)) {
            return "[Circular]";
          }
          visited.add(value);
        }
        return value;
      });
    } catch {
      return '"[Unserializable data]"';
    }
  }

  private formatMessage(level: LogLevel, category: string, message: string, data: unknown = null): string {
    const timestamp = this.getTimestamp();
    let logMessage = `[${timestamp}] [${level}] [${category}] ${message}`;

    if (data !== null && data !== undefined) {
      logMessage += ` | Data: ${this.safeStringify(data)}`;
    }

    return logMessage;
  }

  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, `${message}\n`, "utf8");
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      console.error("Failed to write to log file:", err);
    }
  }

  private logToConsole(level: LogLevel, message: string, data?: unknown): void {
    const tags: Record<LogLevel, string> = {
      INFO: colors.cyan("[INFO]"),
      SUCCESS: colors.green("[SUCCESS]"),
      WARNING: colors.yellow("[WARNING]"),
      ERROR: colors.red("[ERROR]"),
      DEBUG: colors.gray("[DEBUG]"),
      SECURITY: colors.magenta("[SECURITY]"),
      AUDIT: colors.blue("[AUDIT]"),
    };

    const suffix =
      data !== null && data !== undefined
        ? ` ${typeof data === "string" ? data : this.safeStringify(data)}`
        : "";

    console.log(`${tags[level]} ${message}${suffix}`);
  }

  public info(category: string, message: string, data: unknown = null): void {
    const logMessage = this.formatMessage("INFO", category, message, data);
    this.logToConsole("INFO", message, data);
    this.writeToFile(logMessage);
  }

  public success(category: string, message: string, data: unknown = null): void {
    const logMessage = this.formatMessage("SUCCESS", category, message, data);
    this.logToConsole("SUCCESS", message, data);
    this.writeToFile(logMessage);
  }

  public warning(category: string, message: string, data: unknown = null): void {
    const logMessage = this.formatMessage("WARNING", category, message, data);
    this.logToConsole("WARNING", message, data);
    this.writeToFile(logMessage);
  }

  public error(category: string, message: string, error: unknown = null, data: Record<string, unknown> | null = null): void {
    const errorPayload =
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : error !== null
          ? { detail: String(error) }
          : null;

    const errorData: Record<string, unknown> = {
      ...(data ?? {}),
      error: errorPayload,
    };

    const logMessage = this.formatMessage("ERROR", category, message, errorData);
    const consoleMessage = error instanceof Error ? `${message} - ${error.message}` : message;
    this.logToConsole("ERROR", consoleMessage);
    this.writeToFile(logMessage);
  }

  public debug(category: string, message: string, data: unknown = null): void {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
      const logMessage = this.formatMessage("DEBUG", category, message, data);
      this.logToConsole("DEBUG", message, data);
      this.writeToFile(logMessage);
    }
  }

  public security(category: string, message: string, data: Record<string, unknown> | null = null): void {
    const sanitizedData = this.sanitizeData(data);
    const logMessage = this.formatMessage("SECURITY", category, message, sanitizedData);
    this.logToConsole("SECURITY", message);
    this.writeToFile(logMessage);
  }

  public audit(category: string, action: string, userId: string | null = null, data: Record<string, unknown> | null = null): void {
    const auditData: Record<string, unknown> = {
      action,
      userId: userId ? this.maskUserId(userId) : null,
      timestamp: this.getTimestamp(),
      ...(this.sanitizeData(data) ?? {}),
    };

    const logMessage = this.formatMessage("AUDIT", category, `Action: ${action}`, auditData);
    this.writeToFile(logMessage);

    const auditFile = path.join(this.logDir, `audit-${this.getDateString()}.log`);
    try {
      fs.appendFileSync(auditFile, `${logMessage}\n`, "utf8");
    } catch (error) {
      this.error("LOGGER", "Failed to write audit log", error);
    }
  }

  public authAttempt(email: string, success: boolean, reason: string | null = null, mfaRequired = false): void {
    const data = {
      email: this.maskEmail(email),
      success,
      reason,
      mfaRequired,
      timestamp: this.getTimestamp(),
    };

    if (success) {
      this.security("AUTH", "Authentication successful", data);
      return;
    }
    this.security("AUTH", "Authentication failed", data);
  }

  public accountCheck(identifier: string, success: boolean, dataTypes: string[] = [], error: unknown = null): void {
    const data = {
      identifier: this.maskEmail(identifier),
      success,
      dataTypes,
      timestamp: this.getTimestamp(),
    };

    if (success) {
      this.audit("ACCOUNT_CHECK", "Account information retrieved", null, data);
      return;
    }
    this.error("ACCOUNT_CHECK", "Account check failed", error, data);
  }

  public rateLimited(endpoint: string, email: string | null = null): void {
    const data = {
      endpoint,
      email: email ? this.maskEmail(email) : null,
      timestamp: this.getTimestamp(),
    };

    this.warning("RATE_LIMIT", "Rate limit encountered", data);
  }

  public tokenUsage(action: string, success: boolean, error: unknown = null): void {
    const data = {
      action,
      success,
      timestamp: this.getTimestamp(),
    };

    this.audit("TOKEN_USAGE", action, null, data);

    if (!success && error !== null) {
      this.error("TOKEN_USAGE", `Token usage failed: ${action}`, error);
    }
  }

  public bulkOperation(operation: string, totalCount: number, successCount: number, failureCount: number): void {
    const successRate = totalCount > 0 ? `${((successCount / totalCount) * 100).toFixed(2)}%` : "0%";

    const data = {
      operation,
      totalCount,
      successCount,
      failureCount,
      successRate,
      timestamp: this.getTimestamp(),
    };

    this.audit("BULK_OPERATION", operation, null, data);
    this.info("BULK_OPERATION", `Completed ${operation}: ${successCount}/${totalCount} successful`, data);
  }

  private sanitizeData(data: Record<string, unknown> | null): JsonObject | null {
    if (!data) {
      return null;
    }

    const sensitiveFields = new Set(["password", "token", "mfa_code", "totp", "backup_code"]);
    const sanitized: Record<string, unknown> = { ...data };

    for (const [key, value] of Object.entries(sanitized)) {
      if (sensitiveFields.has(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
        continue;
      }

      if (key === "email" && typeof value === "string") {
        sanitized[key] = this.maskEmail(value);
        continue;
      }

      if (key === "userId" && typeof value === "string") {
        sanitized[key] = this.maskUserId(value);
      }
    }

    return sanitized as JsonObject;
  }

  private maskEmail(email: string): string {
    const [username, domain] = email.split("@");
    if (!username || !domain) {
      return email;
    }

    const maskedUsername = username.length > 2 ? `${username.slice(0, 2)}${"*".repeat(username.length - 2)}` : username;
    return `${maskedUsername}@${domain}`;
  }

  private maskUserId(userId: string): string {
    return userId.length > 4 ? `${userId.slice(0, 4)}${"*".repeat(userId.length - 4)}` : userId;
  }

  public getLogStats(): LogStats | null {
    try {
      const logContent = fs.readFileSync(this.logFile, "utf8");
      const lines = logContent.split("\n").filter((line) => line.trim().length > 0);

      const stats: LogStats = {
        totalEntries: lines.length,
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
        security: 0,
        audit: 0,
        debug: 0,
      };

      for (const line of lines) {
        if (line.includes("[INFO]")) stats.info += 1;
        else if (line.includes("[SUCCESS]")) stats.success += 1;
        else if (line.includes("[WARNING]")) stats.warning += 1;
        else if (line.includes("[ERROR]")) stats.error += 1;
        else if (line.includes("[SECURITY]")) stats.security += 1;
        else if (line.includes("[AUDIT]")) stats.audit += 1;
        else if (line.includes("[DEBUG]")) stats.debug += 1;
      }

      return stats;
    } catch (error) {
      this.error("LOGGER", "Failed to get log statistics", error);
      return null;
    }
  }

  public exportLogs(outputPath: string): boolean {
    try {
      const stats = this.getLogStats();
      const exportData = {
        exportTimestamp: this.getTimestamp(),
        logFile: this.logFile,
        statistics: stats,
        logs: fs
          .readFileSync(this.logFile, "utf8")
          .split("\n")
          .filter((line) => line.trim().length > 0),
      };

      fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), "utf8");
      this.info("LOGGER", `Logs exported to ${outputPath}`);
      return true;
    } catch (error) {
      this.error("LOGGER", "Failed to export logs", error);
      return false;
    }
  }

  public cleanOldLogs(daysToKeep = 30): number {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const fileStats = fs.statSync(filePath);

        if (!fileStats.isFile()) {
          continue;
        }

        if (fileStats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount += 1;
        }
      }

      this.info("LOGGER", `Cleaned ${deletedCount} old log files`);
      return deletedCount;
    } catch (error) {
      this.error("LOGGER", "Failed to clean old logs", error);
      return 0;
    }
  }
}

export = Logger;
