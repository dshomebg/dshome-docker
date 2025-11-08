#!/bin/sh

# Docker startup script for backend
# Replaces localhost with host.docker.internal in DATABASE_URL for Docker networking

if [ ! -z "$DATABASE_URL" ]; then
  # Replace localhost with host.docker.internal for Docker
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/localhost/host.docker.internal/g')
  echo "DATABASE_URL configured for Docker networking"
fi

# Start the backend
exec pnpm --filter @dshome/backend start
