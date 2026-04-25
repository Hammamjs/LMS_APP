import { allowedOrigins, isDevMode } from './allowed-origins';

export const corsOption = {
  origin: (origin: string, callback: (...args: unknown[]) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (isDevMode) {
      console.warn(`This is development mode ${origin}`);
    }

    return callback(new Error('Not allowed by cors'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
};
