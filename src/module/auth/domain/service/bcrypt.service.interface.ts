export interface IBcryptService {
  compare: (plainText: string, hashedValue: string) => Promise<boolean>;
  hash: (plainText: string) => Promise<string>;
}
