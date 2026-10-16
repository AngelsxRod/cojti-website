import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description').notNull(),
});
