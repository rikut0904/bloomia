# Dockerfile for Railway deployment - Root context approach
# This approach ensures Railway can find all necessary files

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

# Copy go.mod and go.sum from backend directory for better Docker layer caching
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download && go mod verify

# Copy backend source code
COPY backend/ .

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