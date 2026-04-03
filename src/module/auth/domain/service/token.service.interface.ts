export interface IJWTTokenService {
  generateAuthToken: (
    payload: JwtPayload,
  ) => Promise<{ accessToken: string; refreshToken: string }>;
  generate: (payload: JwtPayload, option: TokenOptions) => Promise<string>;
  verify: <T extends JwtPayload>(token: string, secret: string) => Promise<T>;
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
