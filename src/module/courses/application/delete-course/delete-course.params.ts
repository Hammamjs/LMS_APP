export class DeleteCourseParams {
  constructor(
    public readonly id: string,
    public readonly currentUserId: string,
  ) {}
}
