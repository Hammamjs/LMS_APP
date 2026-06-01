export class UpdateReviewParams {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly review?: string,
    public readonly rating?: number,
  ) {}
}
