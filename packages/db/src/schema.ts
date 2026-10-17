import { int, mysqlTable, text } from 'drizzle-orm/mysql-core';

export const links = mysqlTable('links', {
  id: int('id').primaryKey().autoincrement(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description').notNull(),
});

export * from './auth-schema';
