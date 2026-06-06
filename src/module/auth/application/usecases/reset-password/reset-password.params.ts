export class ResetPasswordParams {
  constructor(
    public email: string,
    public newPassword: string,
    public confirmPassword: string,
  ) {}
}
