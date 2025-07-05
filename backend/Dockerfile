# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Remove shared dependency temporarily for deployment
RUN sed -i '/@realtaste\/shared/d' package.json

# Install production dependencies
RUN npm install --only=production && npm cache clean --force

# Build frontend
FROM base AS frontend-builder
WORKDIR /app/frontend

# Copy shared package to the correct relative location
COPY shared/ ../shared/

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy shared package first
COPY shared/ ./shared/

# Copy backend package files and install ALL dependencies (including dev dependencies for build)
COPY backend/package*.json ./

# Remove shared dependency temporarily for deployment
RUN sed -i '/@realtaste\/shared/d' package.json

RUN npm install

# Copy backend source code
COPY backend/ .

# Build backend
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Shared package is now included locally in types/shared.ts

# Copy built application (we're building from backend directory)
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built frontend
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./frontend-dist

USER nodejs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server.js"]
