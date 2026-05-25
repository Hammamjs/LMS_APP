export class EmailVerifiedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}
