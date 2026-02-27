FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG DATABASE_URL="mongodb://localhost:27017/krausz"
ARG AUTH_GOOGLE_ID="placeholder"
ARG AUTH_GOOGLE_SECRET="placeholder"
ARG AUTH_SECRET="placeholder"
ARG NEXTAUTH_URL="https://placeholder.com"
ARG AUTH_TRUST_HOST="true"

ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_GOOGLE_ID=$AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_SECRET=$AUTH_GOOGLE_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV AUTH_TRUST_HOST=$AUTH_TRUST_HOST

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir -p uploads
COPY --from=builder /app/uploads ./uploads || true

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
