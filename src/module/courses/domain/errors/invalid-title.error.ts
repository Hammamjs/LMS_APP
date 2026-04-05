export class InvalidTitle extends Error {
  constructor(message: string = 'Title is required') {
    super(message);
  }
}
