# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy the rest of your source code
COPY . .

# Build the Vite app
RUN npm run build

# --- Output Stage (dist only) ---
FROM alpine:3.19 AS dist-only

WORKDIR /dist

# Copy only the build output
COPY --from=builder /app/dist .


# The image now contains only the built static files in /dist