export class InvalidPrice extends Error {
  constructor(message: string = 'Price must be positive value') {
    super(message);
  }
}
