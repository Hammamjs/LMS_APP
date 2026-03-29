import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  IJWTTokenService,
  JwtPayload,
  TokenOptions,
} from '../../domain/repository/token.service';

export class TokenService implements IJWTTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: JwtPayload, option: TokenOptions) {
    return this.jwtService.signAsync(payload, option as JwtSignOptions);
  }

  async verify<T extends JwtPayload>(
    token: string,
    options?: TokenOptions,
  ): Promise<T> {
    return this.jwtService.verifyAsync(token, options);
  }
}
