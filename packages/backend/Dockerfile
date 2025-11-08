# Backend Dockerfile
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

# Copy backend package
COPY packages/backend/package.json ./packages/backend/
COPY packages/backend ./packages/backend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package
RUN pnpm --filter @dshome/shared build

# Build backend
RUN pnpm --filter @dshome/backend build

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
COPY --from=base /app/packages/backend ./packages/backend

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Create uploads directory
RUN mkdir -p /app/packages/backend/uploads

# Copy startup script
COPY packages/backend/docker-start.sh /app/packages/backend/
RUN chmod +x /app/packages/backend/docker-start.sh

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start backend using startup script
CMD ["/app/packages/backend/docker-start.sh"]
