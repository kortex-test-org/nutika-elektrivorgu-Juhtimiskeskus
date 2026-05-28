# ---- deps stage ----
FROM oven/bun:1.3 AS deps
WORKDIR /app

# Copy workspace manifests to resolve internal packages
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/


RUN bun install --frozen-lockfile

# ---- build stage ----
FROM deps AS build
WORKDIR /app

COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/
COPY drizzle/ ./drizzle/
COPY drizzle-local/ ./drizzle-local/

RUN cd apps/backend && bun run build

# ---- runtime stage ----
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3001

# Copy workspace packages so symlinks in node_modules can resolve them correctly
COPY --from=build /app/packages ./packages

# Copy workspace root metadata and node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

# Copy backend application files, build outputs (dist), and its node_modules containing @node-rs/argon2
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle-local ./drizzle-local

WORKDIR /app/apps/backend
CMD ["bun", "run", "dist/index.js"]
