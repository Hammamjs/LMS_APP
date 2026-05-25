export class CreateLessonParams {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly duration: number,
    public readonly isFree: boolean,
    public readonly url: string,
    public readonly courseId: string,
    public readonly userId: string,
  ) {}
}
