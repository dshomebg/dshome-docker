import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file (only if not already set by PM2 or other process manager)
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

export const config = {
  // Server
  port: parseInt(process.env.API_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://dev:dev@localhost:5432/dshome_dev',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Meilisearch
  meilisearchUrl: process.env.MEILISEARCH_URL || 'http://localhost:7700',
  meilisearchMasterKey: process.env.MEILISEARCH_MASTER_KEY || 'dev_master_key_change_in_production',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
  jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',

  // Images
  imagesPath: process.env.IMAGES_PATH || './dev-assets/images',
  imagesBaseUrl: process.env.IMAGES_BASE_URL || 'http://localhost:3000/images',
  imagesMaxSize: parseInt(process.env.IMAGES_MAX_SIZE || '5242880', 10), // 5MB

  // Currency & Locale
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'EUR',
  defaultLocale: process.env.DEFAULT_LOCALE || 'bg',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug'
};
