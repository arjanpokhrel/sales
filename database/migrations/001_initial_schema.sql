-- NepaReady Initial PostgreSQL Schema
-- Migration: 001_initial_schema.sql
-- Enables UUID and PostGIS (if available)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_region VARCHAR(100) DEFAULT 'Koshi',
    role VARCHAR(50) DEFAULT 'user', -- 'user' or 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Location Categories
CREATE TABLE IF NOT EXISTS location_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    priority INT DEFAULT 10
);

-- 3. Locations (Hospitals, Police, Fire, Pharmacies, ATMs, Transport hubs)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id VARCHAR(50) REFERENCES location_categories(id),
    name_en VARCHAR(255) NOT NULL,
    name_ne VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address_en VARCHAR(255),
    address_ne VARCHAR(255),
    phone VARCHAR(100),
    emergency_phone VARCHAR(100),
    operating_hours VARCHAR(100) DEFAULT '24/7',
    description_en TEXT,
    description_ne TEXT,
    region VARCHAR(100) NOT NULL, -- 'Biratnagar', 'Dharan', 'Itahari', 'Kathmandu', 'Pokhara'
    district VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'verified', -- 'verified', 'community_submitted'
    verified_by VARCHAR(255) DEFAULT 'NepaReady Disaster Authority',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(255) DEFAULT 'Authoritative Nepal Source',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category_id);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(latitude, longitude);

-- 4. Verified Direct Emergency Services (100, 101, 102, 1155, etc.)
CREATE TABLE IF NOT EXISTS emergency_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ne VARCHAR(255) NOT NULL,
    number VARCHAR(50) NOT NULL,
    description_en TEXT,
    description_ne TEXT,
    priority INT DEFAULT 1,
    is_toll_free BOOLEAN DEFAULT true,
    region_scope VARCHAR(100) DEFAULT 'National',
    source VARCHAR(255) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Emergency Preparedness & Action Guides
CREATE TABLE IF NOT EXISTS guide_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id VARCHAR(50) REFERENCES guide_categories(id),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ne VARCHAR(255) NOT NULL,
    severity VARCHAR(20) DEFAULT 'critical',
    immediate_actions_en JSONB NOT NULL,
    immediate_actions_ne JSONB NOT NULL,
    after_actions_en JSONB NOT NULL,
    after_actions_ne JSONB NOT NULL,
    do_not_actions_en JSONB NOT NULL,
    do_not_actions_ne JSONB NOT NULL,
    when_to_seek_help_en TEXT,
    when_to_seek_help_ne TEXT,
    emergency_contacts JSONB DEFAULT '[]',
    authoritative_source VARCHAR(255) NOT NULL,
    is_published BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transport Routes & Stops
CREATE TABLE IF NOT EXISTS transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region VARCHAR(100) NOT NULL,
    route_number VARCHAR(50) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ne VARCHAR(255) NOT NULL,
    operating_hours VARCHAR(100),
    fare_info_en VARCHAR(255),
    fare_info_ne VARCHAR(255),
    geometry_geojson JSONB,
    stops_count INT DEFAULT 0,
    last_verified DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
    stop_name_en VARCHAR(255) NOT NULL,
    stop_name_ne VARCHAR(255) NOT NULL,
    sequence_order INT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

-- 7. Offline Regional Packs
CREATE TABLE IF NOT EXISTS offline_packs (
    id VARCHAR(100) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    size_mb NUMERIC(5, 1) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description_en TEXT,
    description_ne TEXT,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    zoom_level INT DEFAULT 13,
    bounding_box JSONB,
    is_active BOOLEAN DEFAULT true,
    last_updated DATE DEFAULT CURRENT_DATE
);

-- 8. User Saved Places & Emergency Contacts
CREATE TABLE IF NOT EXISTS saved_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    custom_name VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
