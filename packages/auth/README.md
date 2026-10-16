# @cojti/auth

Better Auth compartido por la web. `src/server.ts` crea el servicio con PostgreSQL y Drizzle; `src/client.ts` expone el cliente React. La web monta el manejador en `/api/auth/[...all]` y valida la sesión en el servidor antes de mostrar `/cuenta`.

Se requieren `DATABASE_URL`, `BETTER_AUTH_SECRET` (al menos 32 caracteres) y `BETTER_AUTH_URL` (origen público de la web). El CLI usa `auth.ts` para generar `packages/db/src/auth-schema.ts`; las migraciones SQL se generan y aplican desde `@cojti/db`.
