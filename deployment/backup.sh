#!/bin/bash

BACKUP_DIR="$DB_BACKUP_PATH"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TMP_PATH="/tmp/wc_backup_$TIMESTAMP"

# Create local backup dir
mkdir -p "$BACKUP_DIR"

echo "DOCKER_SERVICE_DB: $DOCKER_SERVICE_DB"
echo "MONGODB_USER: $MONGODB_USER"
echo "MONGODB_PASSWORD: $MONGODB_PASSWORD"
echo "MONGODB_NAME: $MONGODB_NAME"
echo "$TMP_PATH.archive"

# Run mongodump inside container
echo "Running mongodump inside container..."
docker exec "$DOCKER_SERVICE_DB" mongodump \
    --username "$MONGODB_USER" \
    --password "$MONGODB_PASSWORD" \
    --authenticationDatabase "$MONGODB_NAME" \
    --archive="$TMP_PATH.archive"

# Copy backup to host
echo "Copying backup to host..."
docker cp "$DOCKER_SERVICE_DB:$TMP_PATH.archive" "$BACKUP_DIR/wc_backup_$TIMESTAMP.archive"

# Clean up
docker exec "$DOCKER_SERVICE_DB" rm -f "$TMP_PATH.archive"

# Done 
echo "✅ Mongo backup saved to $BACKUP_DIR/wc_backup_$TIMESTAMP.archive"
