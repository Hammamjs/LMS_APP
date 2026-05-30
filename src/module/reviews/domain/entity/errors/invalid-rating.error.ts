export class InvalidRatingError extends Error {
  constructor(public readonly message: string = 'Invalid rating value') {
    super(message);
  }
}
