import { InvalidRatingError } from '../entity/errors/invalid-rating.error';

export class Rating {
  constructor(private readonly value: number) {}

  public static create(value: number): Rating {
    if (value < 1 || value > 5) throw new InvalidRatingError();

    return new Rating(value);
  }

  public getValue(): number {
    return this.value;
  }
}
