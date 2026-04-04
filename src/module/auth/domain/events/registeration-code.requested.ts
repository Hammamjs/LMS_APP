export class RegisterationCodeRequedEvent {
  readonly action = 'REGISTERATION';
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
