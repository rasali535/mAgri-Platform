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
RUN npm ci --include=dev

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
RUN npm ci --omit=dev

# Copy built application and required folders from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/whatsapp ./whatsapp
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/*.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Set environment
ENV NODE_ENV=production

# Run application
CMD ["node", "index.js"]
