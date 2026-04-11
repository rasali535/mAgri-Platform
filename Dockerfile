# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build frontend
COPY . .
RUN npm run build

# Prune devDependencies to keep node_modules lean for the production stage
RUN npm prune --production

# Production stage
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy pruned node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application and required folders
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/whatsapp ./whatsapp
COPY --from=builder /app/services ./services
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/*.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/metadata.json ./

# Set environment
ENV NODE_ENV=production
# Add memory limits for the Node process to prevent OOM on standard plans
ENV NODE_OPTIONS="--max-old-space-size=400"

EXPOSE 8080

# Run application
CMD ["node", "index.js"]
