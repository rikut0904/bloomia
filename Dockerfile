# RAILWAY DEPLOYMENT DOCKERFILE v2.0 - Context-Safe Build
# Force cache invalidation: Build ID $(date +%Y%m%d%H%M%S)
# This version uses context-safe file copying to bypass Railway path issues

# Build stage
FROM golang:1.21-alpine AS builder

# Install git and ca-certificates for downloading modules and HTTPS requests
RUN apk update && apk add --no-cache git ca-certificates && update-ca-certificates

# Create a non-root user for security
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

# Set working directory
WORKDIR /build

# RAILWAY CACHE BUSTER - Force fresh build context
RUN echo "Railway Build Context Validation - Timestamp: $(date)" && \
    echo "Build ID: RAILWAY_DEPLOY_v2_$(date +%Y%m%d_%H%M%S)"

# Copy entire context to temp location first (Railway-safe approach)
COPY . /tmp/context/

# Validate context structure
RUN echo "=== VALIDATING BUILD CONTEXT ===" && \
    ls -la /tmp/context/ && \
    echo "Backend directory check:" && \
    ls -la /tmp/context/backend/ || echo "ERROR: Backend directory missing"

# Copy go.mod and go.sum from backend directory for dependency caching
RUN cp /tmp/context/backend/go.mod /tmp/context/backend/go.sum ./

# Download dependencies
RUN go mod download && go mod verify

# Copy backend source code
RUN cp -r /tmp/context/backend/* .

# Build the binary with optimizations for production
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o server cmd/server/main.go

# Production stage - minimal scratch image for security and size
FROM scratch

# Copy ca-certificates for HTTPS requests
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy user configuration for security
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copy the compiled binary
COPY --from=builder /build/server /server

# Use non-root user for security
USER appuser:appuser

# Expose port (Railway will override this with PORT env var)
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/server", "--healthcheck"] || exit 1

# Run the server
ENTRYPOINT ["/server"]