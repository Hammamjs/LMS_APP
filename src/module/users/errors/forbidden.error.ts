export class ForbiddenError extends Error {
  constructor(message: string = 'User cannot perform this action') {
    super(message);
    this.message = message;
  }
}
