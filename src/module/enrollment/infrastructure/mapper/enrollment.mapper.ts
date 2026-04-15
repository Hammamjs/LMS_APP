import { Enrollment as EnrollmentPrism } from '@prisma/client';
import { Enrollment } from '../../domain/entity/enrollment.entity';
export class EnrollmentMapper {
  private constructor() {}
  static toDomain(rawEnrollment: EnrollmentPrism): Enrollment {
    return Enrollment.rehydrate(rawEnrollment);
  }
}
