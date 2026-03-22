export interface IUseCase<TParams, TResult> {
  execute: (params: TParams) => TResult;
}
