export type LogContext = Record<string, string | number | boolean | undefined>;

export interface StructuredLogger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext & { error?: unknown }): void;
  metric(name: string, value: number, context?: LogContext): void;
}

export class CloudWatchCompatibleLogger implements StructuredLogger {
  private write(level: "info" | "warn" | "error" | "metric", message: string, context: LogContext = {}) {
    console[level === "metric" ? "info" : level](JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...context }));
  }

  info(message: string, context?: LogContext) { this.write("info", message, context); }
  warn(message: string, context?: LogContext) { this.write("warn", message, context); }
  error(message: string, context?: LogContext & { error?: unknown }) { this.write("error", message, { ...context, error: context?.error instanceof Error ? context.error.message : String(context?.error ?? "") }); }
  metric(name: string, value: number, context?: LogContext) { this.write("metric", name, { ...context, value }); }
}
