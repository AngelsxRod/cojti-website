# syntax=docker/dockerfile:1.7

FROM node:24.11.0-bookworm-slim AS base
RUN npm install --global pnpm@12.4.1
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/jest-config/package.json ./packages/jest-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN HUSKY=0 pnpm install --frozen-lockfile --trust-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM build AS api-package
RUN pnpm --filter cojti-api deploy --prod --trust-lockfile /out/api \
    && cp -R apps/api/dist /out/api/dist

FROM build AS migrate-package
RUN pnpm --filter @cojti/db deploy --prod --trust-lockfile /out/db

FROM node:24.11.0-bookworm-slim AS migrate
ENV NODE_ENV=production
WORKDIR /app
COPY --from=migrate-package --chown=node:node /out/db ./
USER node
CMD ["node", "dist/migrate.js"]

FROM node:24.11.0-bookworm-slim AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=api-package --chown=node:node /out/api ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]

FROM node:24.11.0-bookworm-slim AS web
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3001
CMD ["node", "apps/web/server.js"]
