# check=skip=SecretsUsedInArgOrEnv

FROM oven/bun:1 AS base

# ---------------------------------------------------------------------------- #
#                                 Dependencies                                 #
# ---------------------------------------------------------------------------- #
FROM base AS deps
WORKDIR /app

# --------------------------- Install Dependencies --------------------------- #
RUN apt-get update && apt-get install -y libc6 g++ make
COPY package.json bun.lockb* yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN bun install --ignore-scripts
RUN bun add sharp --ignore-scripts

# ---------------------------------------------------------------------------- #
#                                   Building                                   #
# ---------------------------------------------------------------------------- #
FROM base AS builder
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG AUTH_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ARG HMAC_SECRET_KEY
ENV HMAC_SECRET_KEY=$HMAC_SECRET_KEY
ARG NEXT_PUBLIC_APP_ID
ENV NEXT_PUBLIC_APP_ID=$NEXT_PUBLIC_APP_ID
ARG AUTH_URL
ENV AUTH_URL=$AUTH_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_REGISTRAR
ENV NEXT_PUBLIC_REGISTRAR=$NEXT_PUBLIC_REGISTRAR
ARG NEXT_PUBLIC_REGISTRY
ENV NEXT_PUBLIC_REGISTRY=$NEXT_PUBLIC_REGISTRY

# --------------------------- Environment Variables -------------------------- #
ENV NEXT_TELEMETRY_DISABLED=1

# ----------------------------------- Build ---------------------------------- #
RUN bun run build

# ---------------------------------------------------------------------------- #
#                                    Running                                   #
# ---------------------------------------------------------------------------- #
FROM base AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 bunjs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunjs /app/.next/static ./.next/static

USER nextjs

ARG PORT
ENV PORT=$PORT
EXPOSE $PORT

ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "bun server.js"]
