import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import * as schema from './schema';

// Create postgres connection
const connectionString = config.databaseUrl;
const client = postgres(connectionString, { max: 10 });

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
