import {
  PaginationParams,
  PaginationResult,
} from '../common/pagination.interface';
import { Result } from '../common/result.pattern';

export async function paginate<TDomain, TPrisma>(
  params: PaginationParams & { where?: object | boolean },
  fetcher: (args?: {
    skip: number;
    take: number;
    where?: any;
  }) => Promise<TPrisma[]>,
  counter: (args?: { where: any }) => Promise<number>,
  mapper: (item: TPrisma) => TDomain,
): Promise<Result<PaginationResult<TDomain>>> {
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.max(Number(params.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    counter({ where: params.where }),
    fetcher({
      skip,
      take: limit,
      where: params.where,
    }),
  ]);

  const hasNext = page < total;
  const hasPrev = page > 1;

  return {
    ok: true,
    value: {
      data: items.map(mapper),
      meta: {
        hasNext,
        hasPrev,
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    },
  };
}
