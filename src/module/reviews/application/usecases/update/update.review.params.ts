export class UpdateReviewParams {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly content?: string,
    public readonly rating?: number,
  ) {}
}
