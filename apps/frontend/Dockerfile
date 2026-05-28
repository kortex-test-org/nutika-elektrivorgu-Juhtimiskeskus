# ---- deps stage ----
FROM oven/bun:1.3 AS deps
WORKDIR /app

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
COPY apps/frontend/ ./apps/frontend/

RUN cd apps/frontend && bun run build

# ---- runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copy workspace packages so symlinks in node_modules can resolve them correctly
COPY --from=build /app/packages ./packages

# Copy workspace root metadata and node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

# Copy frontend application files, build outputs (dist), and its node_modules containing vinext
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=build /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=build /app/apps/frontend/node_modules ./apps/frontend/node_modules

WORKDIR /app/apps/frontend
CMD ["npm", "start"]
