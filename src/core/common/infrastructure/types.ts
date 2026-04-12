import { JwtPayload } from '@/module/auth';

export interface RequestWithUser {
  user: JwtPayload;
}
