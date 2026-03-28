export interface IJWTTokenService {
  generate: (
    payload: Record<string, string>,
    option: TokenOptions,
  ) => Promise<string>;
  verify: <T>(token: string) => Promise<T>;
}

export interface TokenOptions {
  expiresIn: string | number;
  secret: string;
}
