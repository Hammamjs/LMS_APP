export const allowedOrigins = [
  ...(process.env.ALLOWED_URLS?.split(',') ?? []),
].filter(Boolean);
