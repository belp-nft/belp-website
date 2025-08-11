# Build BASE
FROM node:20-alpine AS base

WORKDIR /app
ARG BUILD_ENV=dev

# Copy package files
COPY package.json yarn.lock ./

# Install necessary tools and dependencies
RUN apk add --no-cache git \
    && yarn --frozen-lockfile \
    && yarn cache clean

# Build Image
FROM node:20-alpine AS build

WORKDIR /app
ARG BUILD_ENV=dev

# Copy dependencies from base image
COPY --from=base /app/node_modules ./node_modules

# Copy source code and build files
COPY . .

# Install node-prune and other necessary tools, then build
RUN apk add --no-cache git curl \
    && yarn build \
    && curl -sfL https://gobinaries.com/tj/node-prune | sh \
    && node-prune

# Production Image
FROM node:20-alpine AS production

WORKDIR /app
ARG BUILD_ENV=dev

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy necessary files for production
COPY --from=build /app/public ./public

# Copy standalone output and static files
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Command to run the application in production mode
CMD ["node", "server.js"]