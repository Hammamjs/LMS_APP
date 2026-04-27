export class DeleteLessonParams {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly id: string,
  ) {}
}
