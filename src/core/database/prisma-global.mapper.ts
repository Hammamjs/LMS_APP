import { Prisma } from '@prisma/client';
import { Errors, failure } from '../common/domain/err.utils';

export class ErrorMapper {
  private constructor() {}
  public static toResult(err: unknown, entityName: string) {
    console.error('[Prisma Error] ', err);

<<<<<<< Updated upstream
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const code = err.code;
      switch (code) {
=======
    if (
      err instanceof Error &&
      err.constructor.name === 'PrismaClientKnownRequestError'
    ) {
      const prismaErr = err as Prisma.PrismaClientKnownRequestError;
      switch (prismaErr.code) {
>>>>>>> Stashed changes
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
          return failure(Errors.internal(`Database error: ${prismaErr.code}`));
      }
    }

    if (
      err instanceof Error &&
      err.constructor.name === 'PrismaClientValidationError'
    ) {
      return failure(
        Errors.validation(`Invalid data provided for ${entityName}.`),
      );
    }

    return failure(Errors.internal('An unexpected persistence error occured'));
  }
}
