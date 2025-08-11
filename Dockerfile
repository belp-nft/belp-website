# Build BASE
FROM node:18-alpine AS base

WORKDIR /app
ARG BUILD_ENV=dev
COPY package.json yarn.lock .env.${BUILD_ENV} ./


# Install necessary tools and dependencies
RUN apk add --no-cache git \
    && yarn --frozen-lockfile \
    && yarn cache clean

# Build Image
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependencies from base image
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Install node-prune and other necessary tools
RUN apk add --no-cache git curl \
    && yarn build \
    && curl -sfL https://gobinaries.com/tj/node-prune | sh \
    && node-prune

# Production Image
FROM node:18-alpine AS production

WORKDIR /app
ARG BUILD_ENV=dev

# Copy necessary files for production
COPY --from=build /app/public ./public
COPY --from=build /app/.env.${BUILD_ENV} ./.env

# Set mode "standalone" in file "next.config.js"
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static



# Expose the port
EXPOSE 3000

# Command to run the application in production mode using `next start`
CMD ["node", "server.js"]