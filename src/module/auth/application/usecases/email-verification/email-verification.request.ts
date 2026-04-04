export class EmailVerificationRequest {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
