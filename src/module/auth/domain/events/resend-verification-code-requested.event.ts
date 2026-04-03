export class ResendVerificationCodeRequestedEvent {
  readonly action = 'RESEND';
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
