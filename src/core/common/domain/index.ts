// export domain utilities
export { DomainException } from './domain.exception';
export { Errors, failure } from './err.utils';
export { handleError } from './handleError';
export type {
  PaginationParams,
  PaginationResult,
} from './pagination.interface';
export { type DomainError, Result } from './result.pattern';
export type { IUseCase } from './use-case-interface';

// export uow
export { IUNIT_OF_WORK_REPOSITORY, type IUow } from './unit-of-work.interface';
