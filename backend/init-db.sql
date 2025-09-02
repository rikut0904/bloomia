-- Create the bloomia database if it doesn't exist
SELECT 'CREATE DATABASE bloomia'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bloomia')\gexec

-- Connect to the bloomia database
\c bloomia;

-- Create a simple users table for testing
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test user
INSERT INTO users (username, email) VALUES ('testuser', 'test@example.com') ON CONFLICT (username) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bloomia TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;