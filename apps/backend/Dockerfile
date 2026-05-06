# ---- deps stage ----
FROM oven/bun:1.3 AS deps
WORKDIR /app

# Copy workspace manifests to resolve internal packages
COPY package.json bun.lockb ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/

RUN bun install --frozen-lockfile

# ---- build stage ----
FROM deps AS build
WORKDIR /app

COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

RUN cd apps/backend && bun run build

# ---- runtime stage ----
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3001

CMD ["bun", "run", "dist/index.js"]
