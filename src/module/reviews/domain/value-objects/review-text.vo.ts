import { InvalidReviewError } from '../entity/errors/invalid-review.error';

export class ReviewText {
  private constructor(private readonly value: string) {}

  public static create(value: string): ReviewText {
    if (!value || value.trim() == '') throw new InvalidReviewError();

    return new ReviewText(value);
  }

  public getValue(): string {
    return this.value;
  }
}
