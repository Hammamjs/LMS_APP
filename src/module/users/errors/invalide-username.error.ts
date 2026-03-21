export class InvalideUsernameError extends Error {
  constructor(message: string = 'Invalide username') {
    super(message);
    this.message = message;
  }
}
