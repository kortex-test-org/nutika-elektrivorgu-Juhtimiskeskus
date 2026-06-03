# ---- deps stage ----
FROM oven/bun:1.3 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/

RUN bun install --frozen-lockfile

# ---- frontend build stage ----
FROM deps AS frontend-build
WORKDIR /app

COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

# Use relative paths so the browser calls the same domain
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_WS_URL=""

RUN cd apps/frontend && bun run build

# ---- runtime stage ----
FROM nginx:alpine
COPY --from=frontend-build /app/apps/frontend/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
