// export types
export type { RequestWithUser } from './types';

// This decorator for matching password
export { Match } from './decorators/match.decorator';

// this files to map over errors and centeralized error
export { mapDomainErrorTOHttp } from './nest/filters/domain-error.mapper';
export { DomainExceptionFilter } from './nest/filters/domain.exception.filter';

// this to intercept error and shape api response
// to make contorller thin
export { ResultInterceptor } from './nest/interceptors/result.interceptor';

// GUARD to verify user token
export { VerifyJwt } from './nest/guard/verify-jwt.guard';
export { RoleGuard } from './nest/guard/role.guard';
export { Roles } from './decorators/roles.decorator';
export { Public } from './decorators/public.decorator';

// export paginate builder
export {
  type ApiPaginateResponse,
  type ApiResponse,
  ResponseBuilder,
} from './response/response.builder';
