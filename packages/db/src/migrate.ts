import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

import * as schema from './schema';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const connection = await mysql.createConnection({
    uri: databaseUrl,
    timezone: 'Z',
  });
  const db = drizzle({ client: connection, schema, mode: 'default' });

  try {
    await migrate(db, { migrationsFolder: resolve(__dirname, '../drizzle') });
  } finally {
    await connection.end();
  }
}

void main().catch((error: unknown) => {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
});
