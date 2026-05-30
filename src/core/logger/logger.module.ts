import { Global, Module } from '@nestjs/common';
import { ILOGGER_SERVICE } from '@/core';
import { AppLogger } from './infrastructure/app.logger';

@Global()
@Module({
  providers: [
    {
      provide: ILOGGER_SERVICE,
      useClass: AppLogger,
    },
  ],
  exports: [ILOGGER_SERVICE],
})
export class LoggerModule {}
