# BidCargas — portal da empresa
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_ACCOUNT_BASE_DOMAIN=bidcargas.com
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_ACCOUNT_BASE_DOMAIN=$NEXT_PUBLIC_ACCOUNT_BASE_DOMAIN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner

LABEL maintainer="XFDN Tech"
LABEL description="BidCargas portal"
LABEL version="0.0.6"

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3052
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3052

CMD ["node", "server.js"]
