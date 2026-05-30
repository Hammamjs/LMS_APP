import { CourseState, ExcludedFields, Level } from '../types/course.types';
import { InvalidCourseHours } from '../errors/invalid-course-hours.error';
import { InvalidDescription } from '../errors/invalid-description.error';
import { InvalidPrice } from '../errors/invalid-price.error';
import { InvalidTitle } from '../errors/invalid-title.error';
import { randomUUID } from 'crypto';

export class Course {
  private static readonly NEG_NOT_ALLOWED = 'Negative value not allowed';
  private constructor(
    private props: CourseState,
    public readonly isNew: boolean,
  ) {}

  public static create(props: Omit<CourseState, ExcludedFields>): Course {
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
        averageRating: 0,
        reviewsCount: 0,
        isDeleted: false,
      },
      true,
    );
  }

  // ✅ Rehydrate From database
  public static rehydrate(props: CourseState): Course {
    return new Course(props, false);
  }

  public get id(): string {
    return this.props.id;
  }

  public get title(): string {
    return this.props.title;
  }

  public get purchaseCount(): number {
    return this.props.purchaseCount;
  }

  public get originalPrice(): number {
    return this.props.originalPrice;
  }

  public get discountPrice(): number {
    return this.props.discountPrice;
  }

  public get subtitle(): string {
    return this.props.subtitle;
  }
  public get description(): string {
    return this.props.description;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get rating(): number {
    return this.props.rating;
  }

  public get duration(): number {
    return this.props.duration;
  }

  public get slug(): string {
    return this.props.slug;
  }

  public get instructorId(): string {
    return this.props.instructorId;
  }

  public get category(): string {
    return this.props.category;
  }

  public get image(): string | null {
    return this.props.image;
  }

  public get level(): Level {
    return this.props.level;
  }

  public get lessonCount(): number {
    return this.props.lessonCount ?? 0;
  }

  public get requirements(): string[] {
    return this.props.requirements;
  }

  public get whatYouWillLearn(): string[] {
    return this.props.whatYouLearn;
  }

  public get language(): string {
    return this.props.language;
  }

  public get targetAudience(): string[] {
    return this.props.targetAudience;
  }

  public get averageRating(): number {
    return this.props.averageRating;
  }

  public get reviewsCount(): number {
    return this.props.reviewsCount;
  }

  public withTitle(title: string): Course {
    if (!title || title == '') throw new InvalidTitle();

    const newSlug = Course._convertToslug(title);

    return this._copy({ title, slug: newSlug });
  }

  public withLevel(level: Level) {
    if (!level || level.trim() == '')
      throw new Error('Course level not supported for the moment');

    return this._copy({ level });
  }

  public withDescription(description: string): Course {
    if (!description || description == '') throw new InvalidDescription();
    return this._copy({ description });
  }

  public withOriginalPrice(originalPrice: number): Course {
    if (typeof originalPrice !== 'number')
      throw new InvalidPrice('Price must be numeric');

    if (originalPrice < 0) throw new InvalidPrice();

    return this._copy({ originalPrice });
  }

  withLanguage(language: string): Course {
    if (!language || language.trim() == '')
      throw new Error('Language cannot be empty');
    return this._copy({ language });
  }

  withSubtitle(subtitle: string): Course {
    if (!subtitle || subtitle.trim() == '')
      throw new Error('Subtitle is required');

    return this._copy({ subtitle });
  }

  public withRequirements(requirements: string[]): Course {
    // Check if the array itself is empty, or contains any empty entries
    if (!requirements || requirements.length === 0) {
      throw new Error('Requirements cannot be empty');
    }

    const hasEmptyFields = requirements.some((r) => !r || r.trim() === '');
    if (hasEmptyFields) {
      throw new Error('Requirements cannot contain empty values');
    }

    return this._copy({ requirements });
  }

  public withWhatWillLearn(learn: string[]): Course {
    if (!learn || learn.length === 0) {
      throw new Error('What will learn cannot be empty');
    }

    const hasEmptyFields = learn.some((l) => !l || l.trim() === '');
    if (hasEmptyFields) {
      throw new Error('What you will learn cannot contain empty values');
    }

    return this._copy({ whatYouLearn: learn });
  }

  public withTargetAudience(target: string[]): Course {
    if (!target || target.length === 0) {
      throw new Error('Target audience cannot be empty');
    }

    const hasEmptyFields = target.some((t) => !t || t.trim() === '');
    if (hasEmptyFields) {
      throw new Error('Target audience cannot contain empty values');
    }

    return this._copy({ targetAudience: target });
  }

  public withDiscountPrice(discountPrice: number): Course {
    if (typeof discountPrice !== 'number')
      throw new InvalidPrice('Price must be numeric');

    if (discountPrice < 0) throw new InvalidPrice();

    return this._copy({ discountPrice });
  }

  public recordPurchase(): Course {
    return this._copy({ purchaseCount: this.props.purchaseCount + 1 });
  }

  public withCourseDuration(duration: number): Course {
    if (typeof duration !== 'number') throw new InvalidCourseHours();
    if (duration < 0) throw new InvalidCourseHours(Course.NEG_NOT_ALLOWED);
    return this._copy({ duration });
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
    if (!this.isOwnedBy(userId)) {
      throw new Error("You don't have permission to perform this operation");
    }

    return this._copy({ isDeleted: true });
  }

  // guard
  public isOwnedBy(userId: string): boolean {
    return this.props.instructorId === userId;
  }

  private _copy(props: Partial<CourseState>): Course {
    return new Course(
      { ...this.props, ...props, updatedAt: new Date() },
      this.isNew,
    );
  }

  public get toPersistence() {
    return {
      id: this.props.id,
      title: this.props.title,
      subtitle: this.props.subtitle,
      isDeleted: this.props.isDeleted,
      originalPrice: this.props.originalPrice,
      discountPrice: this.props.discountPrice,
      duration: this.props.duration,
      level: this.props.level,
      slug: this.props.slug,
      description: this.props.description,
      rating: this.props.rating,
      purchaseCount: this.props.purchaseCount,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      instructorId: this.props.instructorId,
      image: this.props.image,
      category: this.props.category,

      averageRating: this.props.averageRating,
      reviewsCount: this.props.reviewsCount,

      requirements: this.props.requirements,
      whatYouLearn: this.props.whatYouLearn,
      targetAudience: this.props.targetAudience,
      language: this.props.language,
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
