export interface IBcryptService {
  compare: (plainPassword: string, hashedPassword: string) => Promise<boolean>;
  hash: (password: string) => Promise<string>;
}
