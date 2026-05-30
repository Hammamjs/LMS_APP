import { Injectable, Logger } from '@nestjs/common';
import { LoggerHelper, LogType } from '../helpers/log-writer';
import { ILoggerService } from '../domain/logger.service.interface';

@Injectable()
export class AppLogger extends Logger implements ILoggerService {
  private _fileLogger = new LoggerHelper();

  protected override readonly context = 'App';

  constructor() {
    super();
  }

  override log(message: string, context?: string): void {
    const localContext = context ?? this.context;
    super.log(message, localContext);
    void this._fileLogger.write(message, LogType.INFO, localContext);
  }

  override error(message: string, stack?: string, context?: string): void {
    const localContext = context ?? this.context;
    super.error(message, stack, context);
    void this._fileLogger.write(
      `${message} ${stack ?? ''}`,
      LogType.ERROR,
      localContext,
    );
  }

  override warn(message: string, context?: string): void {
    const localContext = context ?? this.context;
    super.warn(message, localContext);
    void this._fileLogger.write(message, LogType.WARN, localContext);
  }
}
