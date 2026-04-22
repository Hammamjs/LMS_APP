import { randomUUID } from 'crypto';
import { EnrollmentProps, EnrollmentState, Status } from './enrollment.types';

export class Enrollment {
  private constructor(
    private props: EnrollmentState,
    public isNew: boolean,
  ) {}

  // Create enrollment
  public static create(
    props: Pick<EnrollmentProps, 'userId' | 'courseId'>,
  ): Enrollment {
    return new Enrollment(
      {
        id: randomUUID(),
        courseId: props.courseId,
        userId: props.userId,
        completedLessonsIds: [],
        enrolledAt: new Date(),
        status: 'ACTIVE',
        progressPercentage: 0,
        createdAt: new Date(),
      },
      true,
    );
  }

  // Rehydrate
  public static rehydrate(props: EnrollmentState): Enrollment {
    return new Enrollment(props, false);
  }

  public getId(): string {
    return this.props.id;
  }

  public getCourseId(): string {
    return this.props.courseId;
  }

  public getUserId(): string {
    return this.props.userId;
  }

  public getCurrentStatus(): Status {
    return this.props.status;
  }

  public getEnrolledAt(): Date {
    return this.props.enrolledAt;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public isActive(): boolean {
    return this.props.status == 'ACTIVE';
  }

  public isRefunded(): boolean {
    return this.props.status == 'REFUND';
  }

  public isCompleted(): boolean {
    return this.props.status == 'COMPLETED';
  }

  public calcProgress(total: number): number {
    return Math.min(
      100,
      Math.round((this.props.completedLessonsIds.length / total) * 100),
    );
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

  public markAsActive(): Enrollment {
    return this._copy({ status: 'ACTIVE' });
  }

  public compeleteLesson(
    lessonId: string,
    totalLessonsCount: number,
  ): Enrollment {
    if (this.props.status === 'REFUND') return this;
    if (this.props.completedLessonsIds.includes(lessonId)) return this;

    const newCompletedIds = [...this.props.completedLessonsIds, lessonId];

    const newPercentage =
      totalLessonsCount <= 0
        ? 0
        : Math.min(
            100,
            Math.round((newCompletedIds.length / totalLessonsCount) * 100),
          );

    const newStatus: Status =
      newPercentage == 100 ? 'COMPLETED' : this.props.status;

    return this._copy({
      completedLessonsIds: newCompletedIds,
      progressPercentage: newPercentage,
      status: newStatus,
    });
  }

  // to return row of data
  public toPersistence() {
    return {
      id: this.props.id,
      courseId: this.props.courseId,
      userId: this.props.userId,
      createdAt: this.props.createdAt,
      completedLessonsIds: this.props.completedLessonsIds,
      enrolledAt: this.props.enrolledAt,
      status: this.props.status,
      progressPercentage: this.props.progressPercentage,
    };
  }

  private _copy(props: Partial<EnrollmentProps>): Enrollment {
    return new Enrollment({ ...this.props, ...props }, false);
  }
}
