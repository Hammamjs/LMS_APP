export class InvalidContentError extends Error {
  constructor(public readonly message: string = 'Invalid review input') {
    super(message);
  }
}
