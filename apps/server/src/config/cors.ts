import { CorsOptions } from 'cors';
import { env } from '@vochatix/config';

export const corsOptions: CorsOptions = {
  origin: env.CLIENT_URLS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
};
