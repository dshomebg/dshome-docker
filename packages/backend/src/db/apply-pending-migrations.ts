import postgres from 'postgres';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';

async function applyPendingMigrations() {
  console.log('Applying pending migrations...');

  const sql = postgres(config.databaseUrl, { max: 1 });

  try {
    // Read migration files
    const migration0007 = fs.readFileSync(
      path.join(__dirname, 'migrations', '0007_add_features.sql'),
      'utf-8'
    );
    const migration0008 = fs.readFileSync(
      path.join(__dirname, 'migrations', '0008_update_categories.sql'),
      'utf-8'
    );

    // Apply 0007_add_features.sql
    console.log('Applying 0007_add_features.sql...');
    await sql.unsafe(migration0007);
    console.log('✅ 0007_add_features.sql applied');

    // Apply 0008_update_categories.sql
    console.log('Applying 0008_update_categories.sql...');
    await sql.unsafe(migration0008);
    console.log('✅ 0008_update_categories.sql applied');

    // Update the drizzle migrations table
    console.log('Updating migration tracking...');
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES
        (${'0007_add_features'}, ${Date.now()}),
        (${'0008_update_categories'}, ${Date.now()})
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Migration tracking updated');

    console.log('✅ All pending migrations applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyPendingMigrations();
