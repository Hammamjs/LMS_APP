export class CannotChangeEmailError extends Error {
  constructor(message: string = 'Email is already verified cannot replaced') {
    super(message);
    this.message = message;
  }
}
