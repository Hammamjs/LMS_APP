export interface IFactoryTest<TParams, TDomain> {
  build: (params?: Partial<TParams>) => TDomain;
}
