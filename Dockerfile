# TyreHero Emergency Service - Production Dockerfile
# 
# Multi-stage build for optimized production deployment
# Includes security hardening and performance optimizations

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Add build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Run any build steps if needed
RUN npm run lint || true

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tyrehero -u 1001

# Install production dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files from builder
COPY --from=builder --chown=tyrehero:nodejs /app/server.js ./
COPY --from=builder --chown=tyrehero:nodejs /app/service-worker.js ./
COPY --from=builder --chown=tyrehero:nodejs /app/start.sh ./
COPY --from=builder --chown=tyrehero:nodejs /app/index.html ./
COPY --from=builder --chown=tyrehero:nodejs /app/assets ./assets/
COPY --from=builder --chown=tyrehero:nodejs /app/images ./images/

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R tyrehero:nodejs /app/logs

# Make start script executable
RUN chmod +x /app/start.sh

# Switch to non-root user
USER tyrehero

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]