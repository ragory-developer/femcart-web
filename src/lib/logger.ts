/**
 * Professional Enterprise Frontend Logger
 *
 * Features:
 * - Remote Telemetry: Batches logs and sends them securely to the backend.
 * - Global Error Trapping: Catches React render errors and uncaught promises automatically.
 * - Rich Context: Injects Browser, OS, Session, URL, and User ID into every log.
 * - Beacon API: Ensures critical logs are transmitted even if the user closes the tab.
 */

import { API_URL } from "./config";

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogOptions {
  context?: string;
  data?: any;
  error?: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  data?: any;
  error?: any;
  user_id?: string;
  session_id?: string;
  user_agent: string;
  url: string;
  screen_resolution: string;
}

class EnterpriseLogger {
  private isProduction = process.env.NODE_ENV === "production";
  private enableDebug = process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === "true";
  private telemetryUrl = `${API_URL}/api/telemetry/logs`; // Assumed backend endpoint

  private logQueue: LogEntry[] = [];
  private maxQueueSize = 50;
  private flushIntervalMs = 5000;
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId = this.generateSessionId();

  constructor() {
    if (typeof window !== "undefined") {
      this.startFlushInterval();
      this.attachExitListener();
    }
  }

  private generateSessionId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getDeviceContext() {
    if (typeof window === "undefined") {
      return {
        user_agent: "server",
        url: "server",
        screen_resolution: "server",
      };
    }
    return {
      user_agent: window.navigator.userAgent,
      url: window.location.href,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
    };
  }

  private getUserId() {
    if (typeof window === "undefined") return undefined;
    try {
      const userStr =
        localStorage.getItem("femcart_user") || localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.id || user?.userId || undefined;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  private enqueueLog(level: LogLevel, message: string, options?: LogOptions) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: options?.context,
      data: options?.data,
      error:
        options?.error instanceof Error
          ? {
              name: options.error.name,
              message: options.error.message,
              stack: options.error.stack,
            }
          : options?.error,
      user_id: this.getUserId(),
      session_id: this.sessionId,
      ...this.getDeviceContext(),
    };

    this.logQueue.push(entry);

    // If queue is full or error is critical, flush immediately
    if (
      this.logQueue.length >= this.maxQueueSize ||
      level === "error" ||
      level === "fatal"
    ) {
      this.flushLogs();
    }
  }

  private async flushLogs() {
    if (this.logQueue.length === 0 || typeof window === "undefined") return;

    const logsToSend = [...this.logQueue];
    this.logQueue = []; // Clear queue immediately to prevent duplicate sends

    if (!this.isProduction && !this.enableDebug) {
      // In dev mode, we just clear the queue and don't spam the network unless forced
      // But if we want to test telemetry locally, we could remove this check
    }

    try {
      // Use navigator.sendBeacon for highly reliable, non-blocking delivery
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ logs: logsToSend })], {
          type: "application/json",
        });
        navigator.sendBeacon(this.telemetryUrl, blob);
      } else {
        await fetch(this.telemetryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: logsToSend }),
          keepalive: true,
        });
      }
    } catch (e) {
      // Silently fail network logging to prevent infinite loops
    }
  }

  private startFlushInterval() {
    if (typeof window === "undefined") return;
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.flushIntervalMs);
  }

  private attachExitListener() {
    if (typeof window === "undefined") return;
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushLogs();
      }
    });
    window.addEventListener("pagehide", () => this.flushLogs());
  }

  /**
   * Initialize Global Error Boundaries
   * Call this once in _app.tsx or layout.tsx
   */
  public initializeGlobalErrorHandling() {
    if (typeof window === "undefined") return;

    window.addEventListener("error", (event) => {
      this.fatal("Uncaught Error", {
        error: event.error,
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
        },
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.fatal("Unhandled Promise Rejection", { error: event.reason });
    });
  }

  private printToConsole(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ) {
    if (this.isProduction) return; // Silent in prod console

    const colors = {
      debug: "\x1b[34m", // Blue
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      fatal: "\x1b[41m\x1b[37m", // Red BG
      reset: "\x1b[0m",
    };

    const color = colors[level];
    const timestamp = new Date().toLocaleTimeString();
    const ctx = options?.context ? `[${options.context}]` : "";
    const prefix = `${color}[${level.toUpperCase()}]${colors.reset} ${timestamp} ${ctx}`;

    const loggerFn =
      level === "error" || level === "fatal"
        ? console.error
        : level === "warn"
          ? console.warn
          : console.info;

    loggerFn(prefix, message);
    if (options?.data) loggerFn("Data:", options.data);
    if (options?.error) loggerFn(options.error);
  }

  public fatal(message: string, options?: LogOptions) {
    this.printToConsole("fatal", message, options);
    this.enqueueLog("fatal", message, options);
  }

  public error(message: string, error?: unknown, context?: string) {
    const options = { error, context };
    this.printToConsole("error", message, options);
    this.enqueueLog("error", message, options);
  }

  public warn(message: string, data?: any, context?: string) {
    const options = { data, context };
    this.printToConsole("warn", message, options);
    this.enqueueLog("warn", message, options);
  }

  public info(message: string, data?: any, context?: string) {
    const options = { data, context };
    this.printToConsole("info", message, options);
    this.enqueueLog("info", message, options);
  }

  public debug(message: string, data?: any, context?: string) {
    if (this.isProduction && !this.enableDebug) return;
    const options = { data, context };
    this.printToConsole("debug", message, options);
    this.enqueueLog("debug", message, options);
  }

  public trackPerformance(
    metricName: string,
    value: number,
    tags?: Record<string, string>,
  ) {
    // Specialized format for performance metrics
    this.enqueueLog("info", `Performance: ${metricName}`, {
      data: { metric: metricName, value, tags },
      context: "Performance",
    });
  }
}

export const Logger = new EnterpriseLogger();
