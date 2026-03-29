export interface IJWTTokenService {
  generate: (payload: JwtPayload, option: TokenOptions) => Promise<string>;
  verify: <T extends JwtPayload>(
    token: string,
    options?: TokenOptions,
  ) => Promise<T>;
}

export interface TokenOptions {
  expiresIn: string | number;
  secret: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
