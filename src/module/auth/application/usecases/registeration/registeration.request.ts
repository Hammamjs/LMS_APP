export class RegisterationRequest {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly confirmPassword: string,
    public readonly username: string,
    public readonly phone?: string,
  ) {}
}
