# Multi-stage Dockerfile for Auth Service

# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Stage 2: Production stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code from builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/scripts ./scripts

# Create uploads directory with proper permissions
RUN mkdir -p uploads/profiles && \
    chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5001

# Start the application
CMD ["node", "src/server.js"]
