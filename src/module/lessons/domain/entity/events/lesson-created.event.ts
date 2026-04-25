export class LessonCreatedEvent {
  constructor(
    public readonly lessonId: string,
    public readonly courseId: string,
    public readonly courseTitle: string,
  ) {}
}
