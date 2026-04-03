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
export class AuthSendEmail implements IEventHandler<
  ResendVerificationCodeRequestedEvent | ResetPasswordRequestedEvent
> {
  constructor(
    @Inject(IEMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async handle(event: EventType) {
    const subject = this._getSubject(event);
    try {
      await this.emailService.send(
        event.email,
        subject,
        `Your new code is <br /> ${event.code} <br /> it valid only for 10 min`,
      );
    } catch {
      // return failure(Errors.internal(`Failed send code to ${event.email}`));
      // This event is fire and forgot so we need to log error
      // ***TO DO***
    }
  }

  private _getSubject(event: EventType): string {
    switch (event.action) {
      case 'RESET':
        return 'Reset Password Code';
      case 'RESEND':
        return 'Resend Password Code';
      case 'REGISTERATION':
        return 'Registeration Code';
      default:
        return 'Authentication Notification';
    }
  }
}
