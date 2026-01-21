# Multi-stage build for Vite React application

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Accept build arguments
ARG VITE_AUTH_API_URL
ARG VITE_PMS_API_URL
ARG VITE_APP_NAME="WLAN Warehouse Management"
ARG VITE_SESSION_TIMEOUT=1800000
ARG VITE_TOKEN_REFRESH_INTERVAL=300000

# Set environment variables for Vite build
ENV VITE_AUTH_API_URL=${VITE_AUTH_API_URL}
ENV VITE_PMS_API_URL=${VITE_PMS_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_SESSION_TIMEOUT=${VITE_SESSION_TIMEOUT}
ENV VITE_TOKEN_REFRESH_INTERVAL=${VITE_TOKEN_REFRESH_INTERVAL}

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
