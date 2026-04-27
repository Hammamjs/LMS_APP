export class UpdateLessonParams {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly id: string,
    public readonly video: string,
    public readonly sourceLink: string,
    public readonly courseId: string,
    public readonly isFree: string,
    public readonly userId: string,
  ) {}
}
