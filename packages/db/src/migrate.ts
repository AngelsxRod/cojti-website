import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { createDatabase } from './client';

async function main() {
  const { db, pool } = createDatabase(process.env.DATABASE_URL);

  try {
    await migrate(db, { migrationsFolder: resolve(__dirname, '../drizzle') });
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
});
