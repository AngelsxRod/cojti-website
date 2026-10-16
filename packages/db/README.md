# @cojti/db

Esquema PostgreSQL, conexión Drizzle y migraciones del proyecto. Cambie `src/schema.ts`, ejecute `pnpm --filter @cojti/db db:generate` desde la raíz y revise los archivos creados en `drizzle/`. Después de compilar el paquete, aplique las migraciones con `pnpm --filter @cojti/db db:migrate` y `DATABASE_URL` configurada.
