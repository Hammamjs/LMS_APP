import { ILOGGER_SERVICE, type ILoggerService } from '@/core';
import { IEMAIL_SERVICE } from '@/module/auth/domain/constants/injection.token';
import { RegisterationCodeRequedEvent } from '@/module/auth/domain/events/registeration-code.requested';
import { ResendVerificationCodeRequestedEvent } from '@/module/auth/domain/events/resend-verification-code-requested.event';
import { ResetPasswordRequestedEvent } from '@/module/auth/domain/events/reset-password-requested.event';
import { IEmailService } from '@/module/auth/domain/service/email.service.interface';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

type EventType =
  | RegisterationCodeRequedEvent
  | ResendVerificationCodeRequestedEvent
  | ResetPasswordRequestedEvent;

@EventsHandler(
  ResendVerificationCodeRequestedEvent,
  ResetPasswordRequestedEvent,
  RegisterationCodeRequedEvent,
)
export class AuthSendEmailHandler implements IEventHandler<
  ResendVerificationCodeRequestedEvent | ResetPasswordRequestedEvent
> {
  constructor(
    @Inject(IEMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  async handle(event: EventType) {
    const subject = this._getSubject(event);
    try {
      await this.emailService.send(event.email, subject, event.code);
    } catch (err) {
      // This event is fire and forgot so we need to log error
      this.logger.error(
        `Failed to send email to ${event.email}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  private _getSubject(event: EventType): string {
    switch (event.action) {
      case 'RESET':
        return 'Reset Password Code';
      case 'RESEND':
        return 'Email verification Code';
      case 'REGISTERATION':
        return 'Verify Email';
      default:
        return 'Authentication Notification';
    }
  }
}
