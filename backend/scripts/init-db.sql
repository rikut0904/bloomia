-- Development database initialization script
-- This script is automatically executed when PostgreSQL starts for the first time

-- Create development database if it doesn't exist
-- (Note: The database is already created by POSTGRES_DB env var)

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE bloomia_dev TO postgres;

-- Log initialization
DO $$ 
BEGIN 
    RAISE NOTICE 'Development database bloomia_dev initialized successfully';
END $$;