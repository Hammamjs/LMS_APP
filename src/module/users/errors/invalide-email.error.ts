export class InvalideEmailError extends Error {
  constructor(message: string = 'Invalide Email') {
    super(message);
    this.message = message;
  }
}
