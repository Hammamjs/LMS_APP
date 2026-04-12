import { CourseProps, CourseState, ExcludedFields } from '../course.types';
import { InvalidCourseHours } from '../errors/invalid-course-hours.error';
import { InvalidDescription } from '../errors/invalid-description.error';
import { InvalidPrice } from '../errors/invalid-price.error';
import { InvalidTitle } from '../errors/invalid-title.error';
import { randomUUID } from 'crypto';

export class Course {
  private NEG_NOT_ALLOWED: string = 'Negative value not allowed';
  private constructor(
    private props: CourseState,
    public readonly isNew: boolean,
  ) {}

  public static create(props: Omit<CourseProps, ExcludedFields>): Course {
    const slug = this._convertToslug(props.title);
    return new Course(
      {
        ...props,
        id: randomUUID(),
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        purchaseCount: 0,
        slug,
        isDeleted: false,
      },
      true,
    );
  }

  // ✅ Rehydrate From database
  public static rehydrate(props: CourseProps): Course {
    return new Course(props, false);
  }

  public getId(): string {
    return this.props.id;
  }

  public getTitle(): string {
    return this.props.title;
  }

  public getPurchaseCount(): number {
    return this.props.purchaseCount;
  }

  public getPrice(): number {
    return this.props.price;
  }

  public getDescription(): string {
    return this.props.description;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getRating(): number {
    return this.props.rating;
  }

  public getCourseHours(): number {
    return this.props.hours;
  }

  public getSlug(): string {
    return this.props.slug;
  }

  public getInstructor(): string {
    return this.props.instructorId;
  }

  public getCategory(): string {
    return this.props.category;
  }

  public getImage(): string | null {
    return this.props.image;
  }

  public withTitle(title: string): Course {
    if (!title || title == '') throw new InvalidTitle();

    const newSlug = Course._convertToslug(title);

    return this._copy({ title, slug: newSlug });
  }

  public withDescription(description: string): Course {
    if (!description || description == '') throw new InvalidDescription();
    return this._copy({ description });
  }

  public withPrice(price: number): Course {
    if (typeof price !== 'number')
      throw new InvalidPrice('Price must be numeric');

    if (price < 0) throw new InvalidPrice();

    return this._copy({ price });
  }

  public recordPurchase(): Course {
    return this._copy({ purchaseCount: this.props.purchaseCount + 1 });
  }

  public withCourseHours(hours: number): Course {
    if (typeof hours !== 'number') throw new InvalidCourseHours();
    if (hours < 0) throw new InvalidCourseHours(this.NEG_NOT_ALLOWED);
    return this._copy({ hours });
  }

  public applyRating(rating: number): Course {
    if (rating > 5 || rating < 0)
      throw new Error('Rating cannot be greater than 5 or less than 0');
    return this._copy({ rating });
  }

  public updateImage(src: string | null): Course {
    if (!src || src.trim() == '') return this._copy({ image: null });
    return this._copy({ image: src });
  }

  public setCategory(category: string): Course {
    category = category.trim();
    if (!category || category == '') throw new Error('Category is required');
    return this._copy({ category });
  }

  // soft deletion
  public withSoftDeletion(userId: string): Course {
    if (userId !== this.props.instructorId || !this.getInstructor())
      throw new Error("You don't have permission to perform this operation");

    return this._copy({ isDeleted: true });
  }

  private _copy(props: Partial<CourseProps>): Course {
    return new Course(
      { ...this.props, ...props, updatedAt: new Date() },
      this.isNew,
    );
  }

  public toPersistence() {
    return {
      id: this.props.id,
      title: this.props.title,
      price: this.props.price,
      hours: this.props.hours,
      slug: this.props.slug,
      description: this.props.description,
      rating: this.props.rating,
      purchaseCount: this.props.purchaseCount,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      instructorId: this.props.instructorId,
      image: this.props.image,
      category: this.props.category,
    };
  }

  private static _convertToslug(slug: string): string {
    return slug
      .toLocaleLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
