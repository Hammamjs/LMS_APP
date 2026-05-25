import { randomUUID } from 'crypto';
import { EnrollmentProps, EnrollmentState, Status } from './enrollment.types';
import { Course } from '@/module/courses';

export class Enrollment {
  private constructor(
    private props: EnrollmentState,
    public isNew: boolean,
  ) {}

  // Create enrollment
  public static create(
    props: Pick<
      EnrollmentState,
      'userId' | 'courseId' | 'totalLessonsCount' | 'course'
    >,
  ): Enrollment {
    return new Enrollment(
      {
        id: randomUUID(),
        courseId: props.courseId,
        userId: props.userId,
        completedLessonsIds: [],
        enrolledAt: new Date(),
        status: 'ACTIVE',
        createdAt: new Date(),
        totalLessonsCount: props.totalLessonsCount,
        course: props.course,
      },
      true,
    );
  }

  // Rehydrate
  public static rehydrate(props: EnrollmentState): Enrollment {
    return new Enrollment(props, false);
  }

  public get id(): string {
    return this.props.id;
  }

  public get courseId(): string {
    return this.props.courseId;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get currentStatus(): Status {
    return this.props.status;
  }

  public get enrolledAt(): Date {
    return this.props.enrolledAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get isActive(): boolean {
    return this.props.status == 'ACTIVE';
  }

  public get course() {
    return this.props.course;
  }

  public get isRefunded(): boolean {
    return this.props.status == 'REFUND';
  }

  public get isCompleted(): boolean {
    return this.props.status == 'COMPLETED';
  }

  public get completedLessons(): string[] {
    return this.props.completedLessonsIds;
  }

  public get totalLessonsCount(): number {
    return this.props.totalLessonsCount;
  }

  public isLessonCompleted(lessonId: string): boolean {
    return this.props.completedLessonsIds.includes(lessonId);
  }

  public markAsCompleted(): Enrollment {
    if (this.props.status !== 'ACTIVE')
      throw new Error('Can only complete an active enrollment');
    return this._copy({ status: 'COMPLETED' });
  }

  public markAsRefund(): Enrollment {
    if (this.props.status === 'REFUND')
      throw new Error('Enrollment is already refunded');
    return this._copy({ status: 'REFUND' });
  }

  public setCourseDetails(course: Course) {
    return this._copy({ course });
  }

  public markAsActive(): Enrollment {
    return this._copy({ status: 'ACTIVE' });
  }

  public get progressPercentage(): number {
    if (this.props.totalLessonsCount <= 0) return 0;

    return Math.min(
      100,
      Math.round(
        (this.props.completedLessonsIds.length / this.props.totalLessonsCount) *
          100,
      ),
    );
  }

  // to return row of data
  public get toPersistence() {
    return {
      id: this.props.id,
      courseId: this.props.courseId,
      userId: this.props.userId,
      createdAt: this.props.createdAt,
      completedLessonsIds: this.props.completedLessonsIds,
      enrolledAt: this.props.enrolledAt,
      totalLessonsCount: this.props.totalLessonsCount,
      status: this.props.status,
    };
  }

  private _copy(props: Partial<EnrollmentProps>): Enrollment {
    return new Enrollment({ ...this.props, ...props }, false);
  }
}
