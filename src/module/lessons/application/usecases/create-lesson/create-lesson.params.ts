export class CreateLessonParams {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly isFree: boolean,
    public readonly sourceLink: string | null,
    public readonly video: string | null,
    public readonly courseId: string,
    public readonly userId: string,
  ) {}
}
