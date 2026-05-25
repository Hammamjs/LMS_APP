import { allowedOrigins } from './allowed-origins';

export const corsOption = {
  origin: (origin: string, cb: (...args: unknown[]) => void) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      cb(null, true);
    } else {
      cb(new Error(`origin blocked by cors ${origin}`));
    }
  },
  optionSuccessStatus: 200,
  credentials: true,
};
