# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# geo-aeo-tracker — multi-stage build using Next.js standalone output.
# Build-time (baked in): NEXT_PUBLIC_* vars only.
# Run-time (passed via docker run -e / compose env_file): secrets
#   BRIGHT_DATA_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STATE_SYNC_SECRET.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base

# --- 1. Install dependencies (lockfile-driven, cached) ---------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- 2. Build -----------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Public, build-time-inlined flags (no secrets). Override with --build-arg.
ARG NEXT_PUBLIC_CLOUD_STORAGE_ENABLED=false
ENV NEXT_PUBLIC_CLOUD_STORAGE_ENABLED=$NEXT_PUBLIC_CLOUD_STORAGE_ENABLED

# Subpath the app is served under (leto.ddns.net/geo). Empty in local dev.
ARG NEXT_PUBLIC_BASE_PATH=/geo
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

RUN npm run build

# --- 3. Runtime (standalone server, non-root) ---------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

# Standalone server + required static assets.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
