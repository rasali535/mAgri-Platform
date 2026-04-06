# mARI Platform Platform - Docker Deployment Summary

## Deployment Status
✓ **ACTIVE** - Container running on port 3000

## Container Details
- **Image**: mARI Platform-app:latest
- **Port**: 3000 (mapped to host:3000)
- **Container ID**: 6d1740522203
- **Status**: Running

## Generated Files

### 1. Dockerfile (Multi-Stage)
**Location**: mARI Platform-Platform/Dockerfile

**Stages**:
- **Builder Stage**: 
  - Node.js 20-slim base
  - Installs build tools (python3, make, g++)
  - Runs `npm ci --include=dev`
  - Builds Vite frontend with `npm run build`
  
- **Production Stage**:
  - Slim Node.js 20 base
  - Runtime deps only: ffmpeg, libwebp
  - Copies built artifacts from builder
  - Includes health check
  - Optimized for security and size

### 2. docker-compose.yml
**Location**: mARI Platform-Platform/docker-compose.yml

**Services**:
- **app** (Production):
  - Port 3000
  - Environment variables from .env
  - Volume mounts for hot reload
  - Health checks enabled
  - Restart policy: unless-stopped

- **app-dev** (Development):
  - Port 3001
  - `npm run dev` with hot reload
  - Watch: src/, public/, package.json
  - Automatic rebuild on file changes

- **postgres** (Optional, commented):
  - Port 5432
  - Alpine 16 image
  - Volume for persistence

### 3. .dockerignore
**Location**: mARI Platform-Platform/.dockerignore

Excludes: node_modules, build artifacts, logs, tests, git, lock files

## Environment Variables Required

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
DATABASE_URL=postgresql://...
META_WHATSAPP_TOKEN=your-token
META_WHATSAPP_PHONE_ID=your-phone-id
META_WEBHOOK_VERIFY_TOKEN=your-verify-token
WEBAPP_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
AT_API_KEY=your-api-key
AT_USERNAME=sandbox
VITE_GEMINI_API_KEY=your-gemini-key
```

## Running the Application

### Production Mode
```bash
docker compose up app
```

### Development Mode (with hot reload)
```bash
docker compose up app-dev
```

### Manual Container Run
```bash
docker run -p 3000:3000 --env-file .env mARI Platform-app:latest
```

## Health Check
Container includes health check that:
- Runs every 30 seconds
- Timeout: 10 seconds
- Retries: 3 times
- Start period: 5 seconds

Health check command: HTTP GET to localhost:3000

## Performance Notes
- Multi-stage build reduces final image size
- Only production dependencies included in final image
- ffmpeg and libwebp included for Baileys media handling
- Build cache optimization for faster rebuilds
