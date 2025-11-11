#!/bin/bash

# DSHome Docker Logs Viewer
# Quick access to container logs

REMOTE_USER="root"
REMOTE_HOST="157.90.129.12"

# Display usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [service] [options]"
    echo ""
    echo "Services:"
    echo "  backend      - Backend API logs"
    echo "  admin        - Admin panel logs"
    echo "  postgres     - PostgreSQL database logs"
    echo "  redis        - Redis cache logs"
    echo "  meilisearch  - Meilisearch logs"
    echo "  all          - All services logs"
    echo ""
    echo "Options:"
    echo "  -f, --follow     Follow log output"
    echo "  -n NUM           Number of lines to show (default: 100)"
    echo ""
    echo "Examples:"
    echo "  $0 backend           # Show last 100 lines of backend logs"
    echo "  $0 backend -f        # Follow backend logs"
    echo "  $0 backend -n 50     # Show last 50 lines"
    echo "  $0 all -f            # Follow all container logs"
    exit 1
fi

SERVICE=$1
shift

# Map service names to container names
case $SERVICE in
    backend)
        CONTAINER="dshome-backend-prod"
        ;;
    admin)
        CONTAINER="dshome-admin-prod"
        ;;
    postgres)
        CONTAINER="dshome-postgres-prod"
        ;;
    redis)
        CONTAINER="dshome-redis-prod"
        ;;
    meilisearch)
        CONTAINER="dshome-meilisearch-prod"
        ;;
    all)
        CONTAINER=""
        ;;
    *)
        echo "Error: Unknown service '$SERVICE'"
        echo "Run '$0' without arguments to see available services"
        exit 1
        ;;
esac

# Build docker logs command
if [ -z "$CONTAINER" ]; then
    # All containers
    CMD="cd /opt/dshome && docker compose -f docker-compose.prod.yml logs"
else
    # Specific container
    CMD="docker logs $CONTAINER"
fi

# Add options
OPTS=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            OPTS="$OPTS -f"
            shift
            ;;
        -n)
            OPTS="$OPTS --tail $2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Default to last 100 lines if not following
if [[ ! $OPTS =~ "-f" ]] && [[ ! $OPTS =~ "--tail" ]]; then
    OPTS="$OPTS --tail 100"
fi

echo "Fetching logs for $SERVICE..."
echo ""
ssh -t "$REMOTE_USER@$REMOTE_HOST" "$CMD $OPTS"
