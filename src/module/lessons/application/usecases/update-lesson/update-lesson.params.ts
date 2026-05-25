export class UpdateLessonParams {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly description?: string,
    public readonly url?: string,
    public readonly duration?: number,
    public readonly isFree?: boolean,
    public readonly title?: string,
  ) {}
}
