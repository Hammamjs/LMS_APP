export const isDevMode = process.env.NODE_ENV == 'development';
const isProdMode = process.env.NODE_ENV == 'production';
const origins = process.env.ALLOWED_URLS!.split(', ');
export const allowedOrigins = [
  ...(isDevMode ? ['http://localhost:*', 'http://127.0.0.1:*'] : []),
  ...(isProdMode ? origins : []),
];
