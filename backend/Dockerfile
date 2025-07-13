# =============================================================================
# REALTASTE BACKEND DOCKERFILE
# =============================================================================
# Optimized multi-stage build for production deployment on Fly.io
# This Dockerfile builds ONLY the backend service

# Use Node.js 18 Alpine for smaller image size and better security
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat dumb-init

# =============================================================================
# DEPENDENCIES STAGE
# =============================================================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Remove shared dependency for production build (types are inlined)
RUN sed -i '/@realtaste\/shared/d' package.json

# Install production dependencies only
RUN npm install --only=production --no-audit --no-fund && \
    npm cache clean --force

# =============================================================================
# BUILD STAGE
# =============================================================================
FROM base AS builder
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Remove shared dependency for build
RUN sed -i '/@realtaste\/shared/d' package.json

# Install all dependencies (including dev dependencies for TypeScript compilation)
RUN npm install --no-audit --no-fund

# Copy source code
COPY backend/src/ ./src/
COPY backend/tsconfig.json ./

# Build the application
RUN npm run build

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3001

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Add health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]
