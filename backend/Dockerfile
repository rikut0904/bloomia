# Multi-stage Dockerfile for Bloomia Backend
# Supports both development and production environments
# Usage:
#   Development: docker build --target development .
#   Production:  docker build --target production . (default)

# Build arguments for environment configuration
ARG ENVIRONMENT=production
ARG GO_VERSION=1.23

# Base builder stage
FROM golang:${GO_VERSION}-alpine AS base

# Install common dependencies
RUN apk update && apk add --no-cache \
    git \
    ca-certificates \
    curl \
    bash && \
    update-ca-certificates

WORKDIR /app

# Copy go.mod and go.sum first for better layer caching
COPY go.mod go.sum ./

# Initialize go.mod if it doesn't exist, otherwise use existing
RUN if [ ! -f go.mod ]; then \
        echo "go.mod not found, initializing..."; \
        go mod init github.com/rikut0904/bloomia/backend; \
    else \
        echo "go.mod found, using existing module definition"; \
    fi

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Tidy up dependencies
RUN go mod tidy

# Development stage
FROM base AS development

# Install additional development tools
RUN apk add --no-cache \
    vim \
    nano \
    postgresql-client \
    redis

# Create non-root user for development
RUN adduser -D -s /bin/bash developer && \
    chown -R developer:developer /app

# Build with debug information for development
RUN go build -gcflags="all=-N -l" -o server ./cmd/server

# Switch to development user
USER developer

# Expose port
EXPOSE 8080

# Development command with hot reload capability
CMD ["./server"]

# Production builder stage
FROM base AS production-builder

# Create production user
ENV USER=appuser
ENV UID=10001

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

# Build optimized binary for production
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo -o server ./cmd/server

# Production stage (default)
FROM scratch AS production

# Import ca-certificates from builder
COPY --from=production-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Import the user and group files from the builder
COPY --from=production-builder /etc/passwd /etc/passwd
COPY --from=production-builder /etc/group /etc/group

# Copy the static executable
COPY --from=production-builder /app/server /server

# Use the unprivileged user
USER appuser:appuser

# Expose port
EXPOSE 8080

# Health check endpoint (disabled for scratch image)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD ["/server", "--healthcheck"] || exit 1

# Run the binary
ENTRYPOINT ["/server"]