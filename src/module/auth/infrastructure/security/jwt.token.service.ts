import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  IJWTTokenService,
  TokenOptions,
} from '../../domain/repository/token.service';

export class TokenService implements IJWTTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: Record<string, string>, option: TokenOptions) {
    return this.jwtService.signAsync(payload, option as JwtSignOptions);
  }

  verify<T>(token: string): Promise<T> {
    return this.jwtService.verify(token);
  }
}
