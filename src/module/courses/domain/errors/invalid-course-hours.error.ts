export class InvalidCourseHours extends Error {
  constructor(message: string = 'Hours must be number') {
    super(message);
  }
}
