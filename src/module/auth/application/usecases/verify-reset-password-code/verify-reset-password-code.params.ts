export class VerifyResetPasswordCodeParam {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
