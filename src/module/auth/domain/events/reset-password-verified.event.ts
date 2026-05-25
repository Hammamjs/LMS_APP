export class ResetPasswordVerifiedEvent {
  constructor(
    public userId: string,
    public email: string,
  ) {}
}
