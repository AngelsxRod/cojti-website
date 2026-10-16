# @cojti/db

Esquema PostgreSQL, conexión Drizzle y migraciones del proyecto. Cambie `src/schema.ts`, ejecute `pnpm --filter @cojti/db db:generate` desde la raíz y revise los archivos creados en `drizzle/`. Después de compilar el paquete, aplique las migraciones con `pnpm --filter @cojti/db db:migrate` y `DATABASE_URL` configurada.

Las tablas de Better Auth están en `src/auth-schema.ts`, generado mediante `pnpm --filter @cojti/auth auth:generate`. Después de regenerarlo, cree una migración con `db:generate`; no use el comando `auth migrate` para este adaptador Drizzle.
