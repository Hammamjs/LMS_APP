export interface ILoggerService {
  log(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  error(message: string, stack?: string, context?: string): void;
}
