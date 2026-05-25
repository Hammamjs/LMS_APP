export class UpdatePasswordParams {
  constructor(
    public newPassword: string,
    public currentPassword: string,
    public id: string,
  ) {}
}
