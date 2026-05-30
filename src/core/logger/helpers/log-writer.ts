import fsPromise from 'fs/promises';
import path from 'path';

export enum LogType {
  ERROR = 'error',
  INFO = 'info',
  WARN = 'warn',
}

export class LoggerHelper {
  async write(message: string, logType: LogType, context: string = 'App') {
    const logDirPath = path.join(process.cwd(), 'logs');
    const logFilePath = path.join(logDirPath, `${logType}.log`);

    await fsPromise.mkdir(logDirPath, { recursive: true });

    const time = new Date().toISOString();
    const line = `[${time}]\t[${logType.toUpperCase()}]\t[${`${context}`}]\t${message}\n`;

    await fsPromise.appendFile(logFilePath, line, { encoding: 'utf-8' });
  }
}
