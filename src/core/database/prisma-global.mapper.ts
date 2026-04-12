import { Prisma } from '@prisma/client';
import { Errors, failure } from '../common/domain/err.utils';

export class ErrorMapper {
  private constructor() {}
  public static toResult(err: unknown, entityName: string) {
    console.error('[Prisma Error] ', err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2025':
          return failure(Errors.notFound(`${entityName} not found`));
        case 'P2002':
          return failure(
            Errors.conflict(
              `${entityName} already exists with this unique value.`,
            ),
          );
        case 'P2003':
          return failure(
            Errors.validation(`Related data for ${entityName} is missing`),
          );
        default:
          return failure(Errors.internal(`Database error: ${err.code}`));
      }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      return failure(
        Errors.validation(`Invalid data provided for ${entityName}.`),
      );
    }

    return failure(Errors.internal('An unexpected persistence error occured'));
  }
}
