import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  IJWTTokenService,
  JwtPayload,
  TokenOptions,
} from '../../domain/service/token.service.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TokenService implements IJWTTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generate(payload: JwtPayload, option: TokenOptions) {
    return this.jwtService.signAsync(payload, option as JwtSignOptions);
  }

  async verify<T extends JwtPayload>(
    token: string,
    secret?: string,
  ): Promise<T> {
    return await this.jwtService.verify(token, { secret });
  }

  async generateAuthToken(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generate(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: '15min',
      }),
      this.generate(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
