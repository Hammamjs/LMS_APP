export class InvalidReviewError extends Error {
  constructor(public readonly message: string = 'Invalid review input') {
    super(message);
  }
}
