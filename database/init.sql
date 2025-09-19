-- TyreHero Emergency Service Database Schema
-- 
-- Production-ready database schema for emergency tyre service
-- Includes tables for bookings, contacts, emergency calls, and analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS tyrehero;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Set search path
SET search_path TO tyrehero, public;

-- Emergency bookings table
CREATE TABLE emergency_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_location TEXT NOT NULL,
    tyre_size VARCHAR(30),
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('car', 'van', 'motorcycle', 'truck')),
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('immediate', 'within-hour', 'within-2hours')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'high' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    completion_time TIMESTAMP,
    technician_id UUID,
    cost DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending',
    customer_ip INET,
    user_agent TEXT,
    location_coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regular bookings table
CREATE TABLE regular_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_location TEXT NOT NULL,
    tyre_size VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 8),
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('car', 'van', 'motorcycle', 'truck')),
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'scheduled', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    scheduled_datetime TIMESTAMP,
    completion_time TIMESTAMP,
    technician_id UUID,
    cost DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending',
    customer_ip INET,
    location_coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    assigned_to UUID,
    response TEXT,
    customer_ip INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency call tracking table
CREATE TABLE emergency_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id VARCHAR(50) UNIQUE NOT NULL,
    source VARCHAR(50) DEFAULT 'website',
    customer_ip INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    duration INTEGER, -- in seconds
    outcome VARCHAR(50), -- connected, no_answer, busy, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technicians table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'off-duty', 'emergency')),
    current_location POINT,
    specializations TEXT[], -- array of specializations
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_jobs INTEGER DEFAULT 0,
    emergency_certified BOOLEAN DEFAULT false,
    vehicle_registration VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coverage areas table
CREATE TABLE coverage_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_name VARCHAR(100) NOT NULL,
    postcode_pattern VARCHAR(20),
    geometry POLYGON,
    emergency_response_time INTEGER, -- minutes
    regular_response_time INTEGER, -- minutes
    active BOOLEAN DEFAULT true,
    technician_ids UUID[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service history table
CREATE TABLE service_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES emergency_bookings(id) ON DELETE CASCADE,
    regular_booking_id UUID REFERENCES regular_bookings(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES technicians(id),
    service_type VARCHAR(50) NOT NULL,
    tyres_fitted INTEGER DEFAULT 0,
    parts_used JSONB,
    labour_hours DECIMAL(4,2),
    total_cost DECIMAL(10,2),
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    technician_notes TEXT,
    before_photos TEXT[],
    after_photos TEXT[],
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics schema tables
CREATE TABLE analytics.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    referrer VARCHAR(500),
    session_id VARCHAR(100),
    view_duration INTEGER, -- seconds
    device_type VARCHAR(20),
    browser VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics.conversion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- emergency_booking, regular_booking, contact, call
    session_id VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    conversion_value DECIMAL(10,2),
    booking_id VARCHAR(50),
    funnel_stage VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring schema tables
CREATE TABLE monitoring.health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monitoring.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    user_agent TEXT,
    ip_address INET,
    user_id UUID,
    session_id VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'fatal')),
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_emergency_bookings_status ON emergency_bookings(status);
CREATE INDEX idx_emergency_bookings_urgency ON emergency_bookings(urgency);
CREATE INDEX idx_emergency_bookings_created_at ON emergency_bookings(created_at);
CREATE INDEX idx_emergency_bookings_location ON emergency_bookings USING GIST(location_coordinates);

CREATE INDEX idx_regular_bookings_status ON regular_bookings(status);
CREATE INDEX idx_regular_bookings_preferred_date ON regular_bookings(preferred_date);
CREATE INDEX idx_regular_bookings_created_at ON regular_bookings(created_at);

CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_location ON technicians USING GIST(current_location);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);

CREATE INDEX idx_emergency_calls_created_at ON emergency_calls(created_at);
CREATE INDEX idx_emergency_calls_source ON emergency_calls(source);

CREATE INDEX idx_coverage_areas_active ON coverage_areas(active);
CREATE INDEX idx_coverage_areas_geometry ON coverage_areas USING GIST(geometry);

-- Analytics indexes
CREATE INDEX idx_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX idx_page_views_page_path ON analytics.page_views(page_path);
CREATE INDEX idx_conversion_events_created_at ON analytics.conversion_events(created_at);
CREATE INDEX idx_conversion_events_type ON analytics.conversion_events(event_type);

-- Monitoring indexes
CREATE INDEX idx_health_checks_created_at ON monitoring.health_checks(created_at);
CREATE INDEX idx_error_logs_created_at ON monitoring.error_logs(created_at);
CREATE INDEX idx_error_logs_severity ON monitoring.error_logs(severity);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emergency_bookings_updated_at BEFORE UPDATE ON emergency_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regular_bookings_updated_at BEFORE UPDATE ON regular_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development/testing
INSERT INTO technicians (employee_id, first_name, last_name, phone, email, emergency_certified, specializations) VALUES
('TECH001', 'John', 'Smith', '07700900001', 'john.smith@tyrehero.co.uk', true, ARRAY['emergency', 'truck', 'car']),
('TECH002', 'Sarah', 'Johnson', '07700900002', 'sarah.johnson@tyrehero.co.uk', true, ARRAY['emergency', 'car', 'van']),
('TECH003', 'Mike', 'Brown', '07700900003', 'mike.brown@tyrehero.co.uk', false, ARRAY['car', 'motorcycle']);

-- Insert sample coverage areas
INSERT INTO coverage_areas (area_name, postcode_pattern, emergency_response_time, regular_response_time) VALUES
('Central London', 'W%', 15, 60),
('North London', 'N%', 20, 90),
('South London', 'S%', 25, 120),
('East London', 'E%', 30, 150),
('M25 Corridor', 'M25%', 10, 45);

-- Create views for common queries
CREATE VIEW emergency_dashboard AS
SELECT 
    eb.booking_id,
    eb.customer_name,
    eb.customer_phone,
    eb.urgency,
    eb.status,
    eb.created_at,
    t.first_name || ' ' || t.last_name as technician_name,
    t.phone as technician_phone,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - eb.created_at))/60 as minutes_since_booking
FROM emergency_bookings eb
LEFT JOIN technicians t ON eb.technician_id = t.id
WHERE eb.status IN ('pending', 'assigned', 'in-progress')
ORDER BY eb.created_at DESC;

CREATE VIEW daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN urgency = 'immediate' THEN 1 END) as immediate_emergencies,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    AVG(EXTRACT(EPOCH FROM (completion_time - created_at))/60) as avg_completion_minutes
FROM emergency_bookings 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create function for coverage check
CREATE OR REPLACE FUNCTION check_coverage(input_postcode TEXT, input_lat DECIMAL, input_lng DECIMAL)
RETURNS TABLE(
    covered BOOLEAN,
    area_name TEXT,
    emergency_response_time INTEGER,
    regular_response_time INTEGER
) AS $$
BEGIN
    -- Simple postcode pattern matching (in production, use proper postcode validation)
    RETURN QUERY
    SELECT 
        ca.active as covered,
        ca.area_name,
        ca.emergency_response_time,
        ca.regular_response_time
    FROM coverage_areas ca
    WHERE ca.active = true
    AND (
        input_postcode ILIKE ca.postcode_pattern
        OR (input_lat IS NOT NULL AND input_lng IS NOT NULL)
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA tyrehero TO tyrehero;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA tyrehero TO tyrehero;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA tyrehero TO tyrehero;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO tyrehero;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO tyrehero;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA monitoring TO tyrehero;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA monitoring TO tyrehero;

-- Create read-only user for reporting
CREATE USER tyrehero_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE tyrehero TO tyrehero_readonly;
GRANT USAGE ON SCHEMA tyrehero TO tyrehero_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA tyrehero TO tyrehero_readonly;
GRANT USAGE ON SCHEMA analytics TO tyrehero_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO tyrehero_readonly;