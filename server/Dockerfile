FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of your application code
COPY . .

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=5001

# Expose the port your app runs on
EXPOSE 5001