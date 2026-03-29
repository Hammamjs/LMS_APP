export class InvalidEmailError extends Error {
  constructor(message: string = 'Invalide Email') {
    super(message);
    this.message = message;
  }
}
