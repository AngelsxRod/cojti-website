# API de Demetrio Cojtí Cuxil

La API usa MariaDB mediante `@cojti/db`. Requiere `DATABASE_URL` para iniciar. Los enlaces comienzan vacíos y se guardan en la tabla `links`.

`GET /links` y `GET /links/:id` son públicos. `POST /links`, `PATCH /links/:id` y `DELETE /links/:id` requieren el encabezado `X-API-Key` con el valor de `LINKS_WRITE_API_KEY`. El cuerpo de creación contiene `title`, `url` HTTP(S) y `description`; PATCH acepta cualquiera de esos campos.

La configuración de Docker y los comandos de desarrollo y migración están en el README de la raíz.
