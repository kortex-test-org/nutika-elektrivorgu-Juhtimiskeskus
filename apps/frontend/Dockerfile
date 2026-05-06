# ---- deps stage ----
FROM oven/bun:1.3 AS deps
WORKDIR /app

COPY package.json bun.lockb ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/

RUN bun install --frozen-lockfile

# ---- build stage ----
FROM deps AS build
WORKDIR /app

COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

RUN cd apps/frontend && bun run build

# ---- runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

COPY --from=build /app/apps/frontend/.next ./.next
COPY --from=build /app/apps/frontend/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

CMD ["node_modules/.bin/vinext", "start"]
