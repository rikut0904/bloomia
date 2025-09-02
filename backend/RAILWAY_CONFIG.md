# Railway Configuration for Bloomia Backend

## Required Environment Variables

### Application Settings
```
PORT=8080
APP_ENV=production
```

### Database Configuration (PostgreSQL)
Railway PostgreSQL addon will automatically provide these variables:
- `DATABASE_URL` - Complete PostgreSQL connection string
- `PGHOST` - PostgreSQL host
- `PGPORT` - PostgreSQL port (usually 5432)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

### Redis Configuration
Railway Redis addon will automatically provide these variables:
- `REDIS_URL` - Complete Redis connection string
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port (usually 6379)
- `REDIS_PASSWORD` - Redis password

### Optional Settings
```
DEFAULT_THEME_COLOR=#FF7F50
DEFAULT_BACKGROUND_COLOR=#fdf8f0
```

## Railway Setup Instructions

### 1. Add PostgreSQL Service
1. In Railway Dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. The service will be automatically configured and connected

### 2. Add Redis Service
1. In Railway Dashboard, click "New Service"
2. Select "Database" → "Redis"
3. The service will be automatically configured and connected

### 3. Backend Service Configuration
1. **Root Directory**: `backend`
2. **Build Command**: (leave empty - uses Dockerfile)
3. **Start Command**: (leave empty - uses Dockerfile)

### 4. Service Dependencies
The backend service should be configured to depend on:
- PostgreSQL service
- Redis service

This ensures the database services start before the backend.

## Health Check Endpoints

- `GET /health` - Returns application health status including database and Redis connectivity
- `GET /api/v1/health` - Same as above
- `GET /api/v1/status` - Same as above

## Monitoring

The health check endpoint will show:
```json
{
  "status": "healthy|degraded",
  "environment": "production",
  "version": "1.0.2",
  "services": {
    "server": "healthy",
    "database": "healthy|unhealthy: error details",
    "redis": "healthy|unhealthy: error details"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Troubleshooting

### Database Connection Issues
1. Check if PostgreSQL service is running
2. Verify `DATABASE_URL` environment variable is set
3. Check logs for connection errors

### Redis Connection Issues
1. Check if Redis service is running
2. Verify `REDIS_URL` environment variable is set
3. Check logs for connection errors

### Service Dependencies
Make sure the backend service is configured to wait for database services to be ready before starting.