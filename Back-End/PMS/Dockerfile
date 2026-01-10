# ===================================
# STAGE 1: Build Stage
# ===================================
FROM python:3.12-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    jpeg-dev \
    zlib-dev

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ===================================
# STAGE 2: Production Stage
# ===================================
FROM python:3.12-alpine

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    jpeg \
    zlib \
    libffi

# Create non-root user
RUN addgroup -g 1000 pmsuser && \
    adduser -D -u 1000 -G pmsuser pmsuser

# Copy Python dependencies from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=pmsuser:pmsuser ./app /app/app
COPY --chown=pmsuser:pmsuser ./docs /app/docs
COPY --chown=pmsuser:pmsuser .env.docker /app/.env

# Create logs directory
RUN mkdir -p /app/logs && chown -R pmsuser:pmsuser /app/logs

# Switch to non-root user
USER pmsuser

# Expose port
EXPOSE 5002

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5002"]
