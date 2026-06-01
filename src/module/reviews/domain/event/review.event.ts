type Action = 'CREATED' | 'UPDATED' | 'DELETED';

export class ReviewChangeEvent {
  constructor(
    public readonly courseId: string,
    public readonly action: Action,
  ) {}
}
