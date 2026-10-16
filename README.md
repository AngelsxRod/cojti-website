# Demetrio Cojtí Cuxil

Sitio personal con una web Next.js, una API NestJS y PostgreSQL. Los paquetes compartidos viven en `packages/`; `@cojti/db` contiene el esquema Drizzle y las migraciones SQL.

## Docker

Copie `.env.example` a `.env` y reemplace las contraseñas y secretos de ejemplo por valores largos y aleatorios. La contraseña de PostgreSQL debe usar caracteres seguros para una URL (letras, números, guiones o guiones bajos). Configure `BETTER_AUTH_URL` con el origen público exacto de la web; use HTTPS fuera del desarrollo local.

```bash
cp .env.example .env
docker compose up --build -d
```

El sitio queda en `http://localhost:3001`. La API solo está disponible dentro de la red de Compose. PostgreSQL publica el puerto 5432 únicamente en `127.0.0.1` para el desarrollo local. Si los puertos están ocupados, configure `COJTI_WEB_PORT` o `COJTI_DB_PORT` antes de iniciar Compose. La tarea `migrate` aplica las migraciones antes de arrancar la API. `docker compose down` detiene los servicios sin borrar el volumen de datos.

## Desarrollo local

Se requiere Node.js 24.11 o superior, pnpm 12.4.1 y Docker Compose. Desde la raíz:

```bash
pnpm install
pnpm dev
```

En el primer inicio, `pnpm dev` crea un `.env` ignorado por Git con credenciales aleatorias, incluido `BETTER_AUTH_SECRET`. Después levanta PostgreSQL con Compose, aplica las migraciones e inicia la web y la API. Si ya tiene un `.env` sin secreto de autenticación, añade uno nuevo sin cambiar los valores existentes. También puede proporcionar `DATABASE_URL` para usar una base de datos existente sin iniciar Compose. La web estará en `http://localhost:3001` y la API en `http://localhost:3000`. `LINKS_WRITE_API_KEY` se usa para las escrituras de `/links`; las lecturas son públicas.

## Autenticación

`@cojti/auth` configura Better Auth con correo y contraseña y el adaptador Drizzle. La web ofrece `/auth` para registro e inicio de sesión, `/cuenta` como página protegida y `/api/auth/*` como API de autenticación del mismo origen. El paquete expone un cliente React y un servicio de servidor para validar sesiones. La API NestJS de enlaces conserva su clave `LINKS_WRITE_API_KEY`; sus rutas no usan todavía las sesiones de Better Auth.

Las tablas `user`, `session`, `account` y `verification` se generan en `packages/db/src/auth-schema.ts` y se aplican con las migraciones de Drizzle. Si cambia la configuración de Better Auth o agrega plugins, actualice `packages/auth/auth.ts` y `packages/auth/src/server.ts`, genere de nuevo el esquema y revise la migración:

```bash
pnpm --filter @cojti/auth auth:generate
pnpm --filter @cojti/db db:generate
pnpm --filter @cojti/db build
pnpm --filter @cojti/db db:migrate
```

## Interfaz

La web usa Tailwind CSS 4 con el plugin de PostCSS. Los 63 componentes disponibles de shadcn/ui están en `packages/ui/src/components`, con dependencias y hooks compartidos en `packages/ui`. Las utilidades específicas de la web están en `apps/web`. El tema está en `apps/web/app/globals.css` y conserva los colores del sitio. Para actualizar o añadir componentes:

```bash
pnpm --dir apps/web exec shadcn add nombre-del-componente
```

El layout ya incluye `TooltipProvider`, necesario para usar los componentes de tooltip. Importe los componentes con rutas como `@cojti/ui/components/button`.

## Esquema y migraciones

Después de modificar `packages/db/src/schema.ts`, genere y revise la migración antes de aplicarla:

```bash
pnpm --filter @cojti/db db:generate
pnpm --filter @cojti/db build
pnpm --filter @cojti/db db:migrate
```

Guarde en el repositorio tanto el SQL como los metadatos generados en `packages/db/drizzle`. Compose aplica las migraciones pendientes en cada inicio; las ya registradas no se repiten.

## Verificación

Husky se activa con `pnpm install`. Antes de cada commit, `.husky/pre-commit` ejecuta `pnpm lint` y `pnpm check-types`; si alguna comprobación falla, el commit se detiene. En Docker se omite la instalación del hook con `HUSKY=0`.

```bash
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
pnpm check-types
```

## Flujo de Git y commits

Este proyecto no tiene CI/CD ni usa pull requests. El trabajo se integra mediante ramas, `git merge` y `git push` desde la terminal. Las comprobaciones de Husky se ejecutan localmente al crear cada commit.

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) con el formato `tipo(área): descripción`. El hook `.husky/commit-msg` valida el mensaje con commitlint. Las áreas admitidas son `web`, `api`, `auth`, `db`, `ui`, `config` y `repo`; use `repo` cuando el cambio abarque varias áreas. Los tipos admitidos son `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `chore` y `revert`. Los commits automáticos de merge están permitidos.

Ejemplos:

```text
feat(web): agrega la sección de publicaciones
fix(api): corrige la validación de enlaces
chore(repo): configura commitlint
```

Flujo habitual:

```bash
git switch -c feat/publicaciones
git add .
git commit -m "feat(web): agrega la sección de publicaciones"
git switch <rama-principal>
git merge --no-ff feat/publicaciones
git push origin <rama-principal>
```
