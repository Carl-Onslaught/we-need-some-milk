#!/bin/bash

echo "Load env variables in .env file..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
set -o allexport
. "$SCRIPT_DIR/.env"
set +o allexport

# Define volumes in an array
DOCKER_VOLUMES=(
    "$DOCKER_VOLUME_CLIENT"
    "$DOCKER_VOLUME_DB"
    "$DOCKER_VOLUME_DB_CONFIG"
)

echo "Shutdown the docker app first"
docker compose down -v --remove-orphans
echo "List docker containers..."
docker compose ps

# Display volume info
echo "Docker Volume Frontend Codes: ${DOCKER_VOLUMES[0]}"
echo "Docker Volume Database: ${DOCKER_VOLUMES[1]}"
echo "Docker Volume Database Config: ${DOCKER_VOLUMES[2]}"
echo "Docker Network: $DOCKER_NETWORK"


echo "Deleting Client Docker volume..."
docker volume rm -f "${DOCKER_VOLUMES[0]}" || true
echo "Docker Volume Frontend Codes ${DOCKER_VOLUMES[0]} deleted."

# Loop through volumes
for VOLUME in "${DOCKER_VOLUMES[@]}"; do
    echo "Checking if volume '$VOLUME' exists..."
    if ! docker volume inspect "$VOLUME" >/dev/null 2>&1; then
        echo "Volume '$VOLUME' not found. Creating it now..."
        docker volume create "$VOLUME"
    else
        echo "Volume '$VOLUME' already exists."
    fi
done

echo "Checking if network '$DOCKER_NETWORK' exists..."
if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    echo "network '$VOLUME' not found. Creating it now..."
    docker network create "$DOCKER_NETWORK"
else
    echo "Network '$DOCKER_NETWORK' already exists."
fi

# Build and run the Docker service
echo "Building and running the Docker service..."
docker compose up -d --build