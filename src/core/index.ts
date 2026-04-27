// This decorator for matching password
export { Match } from './common/infrastructure/decorators/match.decorator';

// this files to map over errors and centeralized error
export { mapDomainErrorTOHttp } from './common/infrastructure/http/filters/domain-error.mapper';
export { DomainExceptionFilter } from './common/infrastructure/http/filters/domain.exception.filter';

// this to intercept error and shape api response
// to make contorller thin
export { ResultInterceptor } from './common/infrastructure/http/interceptors/result.interceptor';

// GUARD to verify user token
export { VerifyJwt } from './common/infrastructure/http/guard/verify-jwt.guard';
export { RoleGuard } from './common/infrastructure/http/guard/role.guard';
export { Roles } from './common/infrastructure/decorators/roles.decorator';
export { Public } from './common/infrastructure/decorators/public.decorator';

// export domain utilities
export { DomainException } from './common/domain/domain.exception';
export { Errors, failure } from './common/domain/err.utils';
export { handleError } from './common/domain/handleError';
export type {
  PaginationParams,
  PaginationResult,
} from './common/domain/pagination.interface';
export { type DomainError, Result } from './common/domain/result.pattern';
export type { IUseCase } from './common/domain/use-case-interface';

// export uow
export {
  IUNIT_OF_WORK_REPOSITORY,
  type IUow,
} from './common/domain/unit-of-work.interface';

// re export database utilities
export { ErrorMapper } from './database/prisma-global.mapper';
export { paginate } from './database/prisma-helper';
export { PrismaService } from './database/prisma.service';

// export types
export type { RequestWithUser } from './common/infrastructure/types';

// export transaction
export { TransactionContext } from './common/infrastructure/http/transaction/transaction.context';

// export paginate builder
export {
  type ApiPaginateResponse,
  type ApiResponse,
  ResponseBuilder,
} from './common/domain/response.builder';
