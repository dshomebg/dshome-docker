import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

// Replace 'postgres' hostname with 'localhost' when running outside Docker
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || 'postgresql://dev:dev@localhost:5432/dshome_dev';

  // If running outside Docker (no DOCKER_ENV), replace service name with localhost
  if (!process.env.DOCKER_ENV) {
    return url.replace('@postgres:', '@localhost:');
  }

  return url;
};

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: getDatabaseUrl()
  }
} satisfies Config;
