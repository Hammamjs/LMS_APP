import { InvalidContentError } from '../entity/errors/invalid-review.error';

export class ContentText {
  private constructor(private readonly value: string) {}

  public static create(value: string): ContentText {
    if (!value || value.trim() == '') throw new InvalidContentError();

    return new ContentText(value);
  }

  public getValue(): string {
    return this.value;
  }
}
