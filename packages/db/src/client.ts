import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import * as schema from './schema';

export function createDatabase(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = mysql.createPool({ uri: databaseUrl, timezone: 'Z' });
  const db = drizzle({ client: pool, schema, mode: 'default' });

  return { db, pool };
}

export type Database = ReturnType<typeof createDatabase>['db'];
