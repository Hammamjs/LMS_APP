export class InvalidDescription extends Error {
  constructor(public message: string = 'Description cannot be empty') {
    super(message);
  }
}
