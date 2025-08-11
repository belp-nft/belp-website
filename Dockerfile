# Build BASE
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install necessary tools and dependencies
RUN apk add --no-cache git \
    && yarn --frozen-lockfile \
    && yarn cache clean

# Build Image
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependencies from base image
COPY --from=base /app/node_modules ./node_modules

# Copy source code and build files
COPY . .

# Install necessary tools and build
RUN apk add --no-cache git \
    && yarn build

# Production Image
FROM node:20-alpine AS production

WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy node_modules from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy package.json and next.config.ts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build /app/public ./public

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Command to run Next.js application
CMD ["yarn", "start"]