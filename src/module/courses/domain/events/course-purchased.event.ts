export class CoursePurchasedEvent {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly courseName: string,
  ) {}
}
