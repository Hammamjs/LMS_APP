export class InvalidUsernameError extends Error {
  constructor(message: string = 'Invalid username') {
    super(message);
    this.message = message;
  }
}
