export class ResetPasswordRequestedEvent {
  readonly action = 'RESET';
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
