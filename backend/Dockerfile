# Multi-stage Dockerfile for Bloomia Backend
# This Dockerfile automatically generates go.mod and go.sum from source code

# Build stage
FROM golang:1.21-alpine AS builder

# Install git and ca-certificates for downloading modules and HTTPS requests
RUN apk update && apk add --no-cache git ca-certificates && update-ca-certificates

# Create appuser
ENV USER=appuser
ENV UID=10001

# Create the user
RUN adduser \    
    --disabled-password \    
    --gecos "" \    
    --home "/nonexistent" \    
    --shell "/sbin/nologin" \    
    --no-create-home \    
    --uid "${UID}" \    
    "${USER}"

WORKDIR /build

# Copy source code first
COPY . .

# Initialize Go module and generate go.mod and go.sum
RUN go mod init github.com/rikut0904/bloomia/backend 2>/dev/null || true
RUN go mod tidy

# Download and verify dependencies
RUN go mod download && go mod verify

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo -o server cmd/server/main.go

# Production stage
FROM scratch

# Import ca-certificates from builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Import the user and group files from the builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copy the static executable
COPY --from=builder /build/server /server

# Use the unprivileged user
USER appuser:appuser

# Expose port (Railway will override this with PORT env var)
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/server", "--healthcheck"] || exit 1

# Run the binary
ENTRYPOINT ["/server"]