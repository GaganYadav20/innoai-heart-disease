-- ============================================
-- CardioVision AI - PostgreSQL Initialization
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (handled by POSTGRES_DB env var)
-- This script runs on first container startup

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cardiovision TO postgres;
