import { ConfigService } from '@nestjs/config';
import { IBcryptService } from '../../domain/service/bcrypt.service.interface';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService implements IBcryptService {
  private readonly saltNumber: number;
  constructor(private readonly config: ConfigService) {
    this.saltNumber = this.config.getOrThrow<number>('SALT_NUMBER');
  }

  async compare(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hash(password: string) {
    return bcrypt.hash(password, Number(this.saltNumber));
  }
}
