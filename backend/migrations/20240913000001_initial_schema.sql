-- +migrate Up
-- Initial database schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    school_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    school_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    permissions TEXT[], -- JSON array of permissions
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_school_id ON schools(school_id);
CREATE INDEX IF NOT EXISTS idx_admins_uid ON admins(uid);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- +migrate Down
-- Rollback initial schema

DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS users;