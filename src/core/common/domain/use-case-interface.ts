export interface IUseCase<TRequest, TResponse> {
  execute: (params: TRequest) => TResponse;
}
