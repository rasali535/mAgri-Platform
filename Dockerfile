# Build stage: compile frontend assets with Vite
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Vite frontend (outputs to 'build' folder)
RUN npm run build

# Production stage: lightweight runtime
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies for Baileys media handling
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application and required folders from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/whatsapp ./whatsapp
COPY --from=builder /app/services ./services
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/*.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/metadata.json ./

# Set environment
ENV NODE_ENV=production
EXPOSE 8080

# Run application
CMD ["node", "index.js"]
