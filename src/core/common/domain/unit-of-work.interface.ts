export interface IUow {
  runInTransaction: <T>(work: () => Promise<T>) => Promise<T>;
}

export const IUNIT_OF_WORK_REPOSITORY = Symbol('IUnitWorkRepository');
