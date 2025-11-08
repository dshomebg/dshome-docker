import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { config } from '../config';

async function runMigrations() {
  console.log('Running migrations...');

  const migrationClient = postgres(config.databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  // Resolve migrations path - works both in dev (from src) and prod (from dist)
  const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');

  try {
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
