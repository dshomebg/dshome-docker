# Admin Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy shared package
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared ./packages/shared

# Copy admin package
COPY packages/admin/package.json ./packages/admin/
COPY packages/admin ./packages/admin

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package
RUN pnpm --filter @dshome/shared build

# Build admin
RUN pnpm --filter @dshome/admin build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy built packages
COPY --from=base /app/packages/shared ./packages/shared
COPY --from=base /app/packages/admin ./packages/admin

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start admin
CMD ["pnpm", "--filter", "@dshome/admin", "start"]
