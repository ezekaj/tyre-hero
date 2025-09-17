# TyreHero Emergency Service - Performance Optimization Configuration

## Executive Summary

This document outlines comprehensive performance optimization strategies for TyreHero's emergency service to ensure sub-second response times during peak emergency periods and weather events that can increase demand by 3-5x.

**Performance Targets:**
- **API Response Time**: <500ms (95th percentile)
- **Emergency Request Processing**: <5 seconds
- **Geographic Response**: <50ms TTFB for UK locations
- **Auto-scaling**: Handle 5x traffic spikes within 2 minutes
- **Database Queries**: <100ms for emergency operations

## 1. Database Performance Optimization

### PostgreSQL Configuration Tuning
```sql
-- Emergency Service Optimized PostgreSQL Configuration
-- File: postgresql.conf

-- Memory Configuration
shared_buffers = '2GB'                    -- 25% of available RAM
effective_cache_size = '6GB'              -- 75% of available RAM
work_mem = '64MB'                         -- For complex queries
maintenance_work_mem = '512MB'            -- For maintenance operations
wal_buffers = '64MB'                      -- WAL buffer size

-- Connection Configuration
max_connections = 200                     -- Support high concurrency
superuser_reserved_connections = 5
shared_preload_libraries = 'pg_stat_statements,pg_prewarm,auto_explain'

-- Query Optimization
random_page_cost = 1.1                    -- Optimized for SSD
effective_io_concurrency = 200            -- SSD optimization
seq_page_cost = 1.0                       -- Sequential scan cost

-- WAL Configuration
wal_level = 'replica'                     -- For read replicas
checkpoint_completion_target = 0.9        -- Spread checkpoints
checkpoint_timeout = '15min'              -- Checkpoint frequency
max_wal_size = '4GB'                      -- WAL size limit
min_wal_size = '512MB'                    -- Minimum WAL size

-- Emergency Service Specific
log_min_duration_statement = 1000         -- Log slow queries >1s
log_statement = 'ddl'                     -- Log schema changes
log_checkpoints = on                      -- Monitor checkpoints
log_connections = on                      -- Track connections
log_disconnections = on                   -- Track disconnections

-- Auto-vacuum tuning for high-write workload
autovacuum_max_workers = 6
autovacuum_naptime = '30s'                -- More frequent vacuum
autovacuum_vacuum_scale_factor = 0.1      -- Vacuum when 10% changed
autovacuum_analyze_scale_factor = 0.05    -- Analyze when 5% changed
```

### Emergency Service Database Schema Optimization
```sql
-- High-performance emergency request processing

-- Partitioned table for better performance
CREATE TABLE emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    location_address TEXT NOT NULL,
    location_coordinates POINT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    vehicle_make_model VARCHAR(255) NOT NULL,
    tyre_issue emergency_issue_type NOT NULL,
    status request_status DEFAULT 'pending',
    priority_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    technician_id UUID REFERENCES technicians(id),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for better query performance
CREATE TABLE emergency_requests_2025_01 PARTITION OF emergency_requests
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE emergency_requests_2025_02 PARTITION OF emergency_requests
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Optimized indexes for emergency service queries
CREATE INDEX CONCURRENTLY idx_emergency_requests_status_priority 
ON emergency_requests (status, priority_level, created_at) 
WHERE status IN ('pending', 'assigned');

CREATE INDEX CONCURRENTLY idx_emergency_requests_location_status 
ON emergency_requests USING GIST (location_coordinates) 
WHERE status = 'pending';

CREATE INDEX CONCURRENTLY idx_emergency_requests_technician_active 
ON emergency_requests (technician_id, status, created_at) 
WHERE status IN ('assigned', 'in_progress');

CREATE INDEX CONCURRENTLY idx_emergency_requests_phone_recent 
ON emergency_requests (phone_number, created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Covering index for dashboard queries
CREATE INDEX CONCURRENTLY idx_emergency_requests_dashboard 
ON emergency_requests (created_at DESC, status) 
INCLUDE (id, customer_name, location_address, priority_level);

-- Materialized view for real-time metrics
CREATE MATERIALIZED VIEW emergency_service_realtime_metrics AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'assigned') as assigned_requests,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_requests,
    COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= CURRENT_DATE) as completed_today,
    AVG(EXTRACT(EPOCH FROM (actual_arrival - created_at))/60) FILTER (WHERE actual_arrival IS NOT NULL AND created_at >= CURRENT_DATE) as avg_response_time_minutes,
    COUNT(*) FILTER (WHERE priority_level >= 3) as high_priority_requests
FROM emergency_requests 
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day';

-- Refresh every 30 seconds
CREATE OR REPLACE FUNCTION refresh_realtime_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY emergency_service_realtime_metrics;
END;
$$ LANGUAGE plpgsql;

-- Optimized technician location queries
CREATE TABLE technician_locations (
    technician_id UUID PRIMARY KEY REFERENCES technicians(id),
    current_location POINT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accuracy_meters INTEGER DEFAULT 10,
    status technician_status DEFAULT 'available'
);

CREATE INDEX CONCURRENTLY idx_technician_locations_available 
ON technician_locations USING GIST (current_location) 
WHERE status = 'available';

CREATE INDEX CONCURRENTLY idx_technician_locations_updated 
ON technician_locations (last_updated DESC) 
WHERE last_updated >= NOW() - INTERVAL '1 hour';
```

### Connection Pool Optimization
```yaml
# PgBouncer Configuration for Emergency Service
# File: pgbouncer.ini

[databases]
tyrehero_emergency = host=tyrehero-primary-db.cluster-xxx.eu-west-2.rds.amazonaws.com port=5432 dbname=tyrehero

[pgbouncer]
listen_port = 5432
listen_addr = 0.0.0.0
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# Pool Configuration for High Concurrency
pool_mode = transaction              # Best for web applications
max_client_conn = 1000              # Maximum client connections
default_pool_size = 50              # Connections per database
min_pool_size = 10                  # Minimum connections kept open
reserve_pool_size = 10              # Emergency reserve connections
reserve_pool_timeout = 3            # Timeout for reserve pool

# Performance Tuning
server_idle_timeout = 600           # 10 minutes
server_connect_timeout = 15         # Connection timeout
server_login_retry = 15             # Login retry delay
query_timeout = 30                  # Query timeout for emergency operations
query_wait_timeout = 20             # Queue timeout

# Logging for monitoring
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
stats_period = 60                   # Statistics period

# Emergency service specific settings
ignore_startup_parameters = extra_float_digits,search_path
application_name_add_host = 1
```

## 2. Redis Cache Optimization

### Redis Configuration for Emergency Service
```redis
# Redis Configuration for Emergency Service Caching
# File: redis.conf

# Memory Configuration
maxmemory 4GB
maxmemory-policy allkeys-lru        # Evict least recently used keys
maxmemory-samples 10                # LRU sampling accuracy

# Persistence for emergency data
save 900 1                          # Save if 1 key changed in 15 minutes
save 300 10                         # Save if 10 keys changed in 5 minutes  
save 60 1000                        # Save if 1000 keys changed in 1 minute
rdbcompression yes
rdbchecksum yes

# Network optimization
tcp-keepalive 300                   # TCP keepalive
timeout 0                           # No client timeout
tcp-backlog 511                     # TCP listen backlog

# Performance tuning
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000

# Slow log for performance monitoring
slowlog-log-slower-than 10000      # Log commands slower than 10ms
slowlog-max-len 128                # Keep last 128 slow commands

# Client output buffer limits
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
```

### Cache Strategy Implementation
```javascript
// Emergency Service Cache Strategy
const cacheStrategies = {
  // Technician locations - very short TTL for real-time accuracy
  technicianLocations: {
    pattern: 'location:technician:{id}',
    ttl: 30, // 30 seconds
    strategy: 'write-through',
    eviction: 'lru'
  },
  
  // Service coverage areas - longer TTL as they change infrequently
  serviceCoverage: {
    pattern: 'coverage:postcode:{postcode}',
    ttl: 3600, // 1 hour
    strategy: 'cache-aside',
    eviction: 'allkeys-lru'
  },
  
  // Emergency request queue - critical, short TTL
  emergencyQueue: {
    pattern: 'queue:emergency:{region}',
    ttl: 60, // 1 minute
    strategy: 'write-through',
    eviction: 'noeviction'
  },
  
  // Pricing calculations - can be cached longer
  pricing: {
    pattern: 'pricing:{service_type}:{location}',
    ttl: 86400, // 24 hours
    strategy: 'cache-aside',
    eviction: 'allkeys-lru'
  },
  
  // Customer session data - critical for ongoing emergencies
  customerSessions: {
    pattern: 'session:customer:{phone}',
    ttl: 7200, // 2 hours
    strategy: 'write-through',
    eviction: 'noeviction'
  }
};

// Cache warming for critical data
async function warmCriticalCaches() {
  console.log('🔥 Warming critical caches...');
  
  // Warm technician locations
  const technicians = await db.query('SELECT id, current_location FROM technicians WHERE status = $1', ['available']);
  for (const tech of technicians) {
    await redis.setex(`location:technician:${tech.id}`, 30, JSON.stringify(tech.current_location));
  }
  
  // Warm service coverage
  const coverageAreas = await db.query('SELECT postcode, covered FROM service_coverage');
  for (const area of coverageAreas) {
    await redis.setex(`coverage:postcode:${area.postcode}`, 3600, area.covered);
  }
  
  // Warm emergency queue counts
  const queueCounts = await db.query(`
    SELECT 
      CASE 
        WHEN ST_DWithin(location_coordinates::geography, ST_Point(-0.1278, 51.5074)::geography, 50000) THEN 'london'
        WHEN ST_DWithin(location_coordinates::geography, ST_Point(-2.2426, 53.4808)::geography, 50000) THEN 'manchester'
        ELSE 'other'
      END as region,
      COUNT(*) as count
    FROM emergency_requests 
    WHERE status = 'pending'
    GROUP BY region
  `);
  
  for (const queue of queueCounts) {
    await redis.setex(`queue:emergency:${queue.region}`, 60, queue.count);
  }
  
  console.log('✅ Critical caches warmed');
}
```

## 3. CDN and Edge Optimization

### CloudFront Performance Configuration
```yaml
# CloudFront Distribution for Emergency Service
cloudfront_configuration:
  origins:
    - domain_name: api.tyrehero.com
      origin_id: emergency-api
      custom_origin_config:
        http_port: 80
        https_port: 443
        origin_protocol_policy: https-only
        origin_ssl_protocols: [TLSv1.2, TLSv1.3]
        origin_keepalive_timeout: 60
        origin_read_timeout: 30
  
  default_cache_behavior:
    target_origin_id: emergency-api
    viewer_protocol_policy: redirect-to-https
    compress: true
    
    # Performance optimizations
    cache_policy:
      name: EmergencyServiceOptimized
      default_ttl: 0                    # No caching for API by default
      max_ttl: 31536000                 # 1 year for static assets
      min_ttl: 0
      
    # Cache based on query strings for API versioning
    query_string_cache_keys: [version, format]
    
    # Headers to forward for proper API behavior
    headers_to_forward:
      - Authorization
      - Content-Type
      - X-Emergency-Priority
      - X-Customer-Location
      - User-Agent
      - CloudFront-Viewer-Country
    
    # Function associations for edge optimization
    function_associations:
      - event_type: viewer-request
        function_arn: "arn:aws:cloudfront::123456789012:function/emergency-routing"
      - event_type: origin-response
        function_arn: "arn:aws:cloudfront::123456789012:function/security-headers"

  # Specific cache behaviors for different content types
  cache_behaviors:
    # Static assets - aggressive caching
    - path_pattern: "/static/*"
      target_origin_id: s3-static-assets
      cache_policy: CachingOptimized
      compress: true
      ttl: 31536000                     # 1 year
      
    # API health checks - short cache for faster failover
    - path_pattern: "/health"
      target_origin_id: emergency-api
      cache_policy: CachingDisabled
      ttl: 0
      
    # Emergency API endpoints - no caching
    - path_pattern: "/api/emergency/*"
      target_origin_id: emergency-api
      cache_policy: CachingDisabled
      ttl: 0
      
    # Location services - short cache
    - path_pattern: "/api/location/*"
      target_origin_id: emergency-api
      cache_policy:
        default_ttl: 300                # 5 minutes
        max_ttl: 900                    # 15 minutes
      
  # Geographic optimization for UK
  geographic_restrictions:
    restriction_type: whitelist
    locations: [GB, IE]                 # UK and Ireland only
    
  # Price class optimization
  price_class: PriceClass_100           # Use only North America and Europe
  
  # HTTP/2 and HTTP/3 support
  http_version: http2and3
  
  # IPv6 support
  ipv6_enabled: true
  
  # Security configuration
  web_acl_id: "arn:aws:wafv2:us-east-1:123456789012:global/webacl/emergency-service-protection"
```

### Edge Function for Emergency Routing
```javascript
// CloudFront Edge Function for Emergency Request Optimization
function handler(event) {
    const request = event.request;
    const headers = request.headers;
    
    // Emergency priority routing
    if (request.uri.startsWith('/api/emergency/')) {
        // Add emergency priority header
        headers['x-emergency-priority'] = {value: 'high'};
        
        // Route based on geographic location for fastest response
        const country = headers['cloudfront-viewer-country'];
        if (country && country.value === 'GB') {
            // UK traffic goes to primary region
            headers['x-preferred-region'] = {value: 'eu-west-2'};
        } else if (country && country.value === 'IE') {
            // Ireland traffic can use either region
            headers['x-preferred-region'] = {value: 'eu-west-1'};
        }
        
        // Add timestamp for latency tracking
        headers['x-request-timestamp'] = {value: Date.now().toString()};
    }
    
    // Security headers
    headers['strict-transport-security'] = {value: 'max-age=31536000; includeSubDomains'};
    headers['x-content-type-options'] = {value: 'nosniff'};
    headers['x-frame-options'] = {value: 'DENY'};
    
    return request;
}
```

## 4. Auto-Scaling Configuration

### ECS Auto-Scaling for Emergency Spikes
```yaml
# ECS Auto-Scaling Configuration
ecs_autoscaling:
  service_name: tyrehero-emergency-api
  cluster_name: tyrehero-production
  
  # Scaling configuration
  min_capacity: 6                      # Always maintain minimum capacity
  max_capacity: 50                     # Maximum during emergencies
  desired_capacity: 8                  # Normal operation capacity
  
  # Target tracking scaling policies
  scaling_policies:
    # CPU-based scaling
    - policy_name: cpu-scaling
      policy_type: TargetTrackingScaling
      target_tracking_scaling_policy:
        target_value: 60.0              # Target CPU utilization
        scale_out_cooldown: 60          # Scale out quickly
        scale_in_cooldown: 300          # Scale in slowly
        predefined_metric_specification:
          predefined_metric_type: ECSServiceAverageCPUUtilization
    
    # Memory-based scaling
    - policy_name: memory-scaling
      policy_type: TargetTrackingScaling
      target_tracking_scaling_policy:
        target_value: 70.0              # Target memory utilization
        scale_out_cooldown: 60
        scale_in_cooldown: 300
        predefined_metric_specification:
          predefined_metric_type: ECSServiceAverageMemoryUtilization
    
    # Custom metric scaling - emergency requests per minute
    - policy_name: emergency-requests-scaling
      policy_type: TargetTrackingScaling
      target_tracking_scaling_policy:
        target_value: 10.0              # Target requests per minute per task
        scale_out_cooldown: 60
        scale_in_cooldown: 180
        customized_metric_specification:
          metric_name: EmergencyRequestsPerMinute
          namespace: TyreHero/Emergency
          statistic: Average
          
  # Weather-based predictive scaling
  scheduled_scaling:
    - schedule_name: winter-weather-prep
      schedule: "cron(0 6 * 12-2 *)"   # Daily at 6 AM during winter months
      min_capacity: 12
      max_capacity: 50
      desired_capacity: 15
      
    - schedule_name: evening-scale-down
      schedule: "cron(0 22 * * *)"     # Daily at 10 PM
      min_capacity: 6
      max_capacity: 30
      desired_capacity: 8

# Application Load Balancer scaling
alb_target_groups:
  emergency_api:
    health_check:
      enabled: true
      healthy_threshold_count: 2
      interval_seconds: 15             # Faster health checks
      matcher: 200
      path: /health
      port: 3000
      protocol: HTTP
      timeout_seconds: 5
      unhealthy_threshold_count: 3
    
    # Connection draining for graceful scaling
    deregistration_delay: 30           # Quick deregistration for scaling
    
    # Sticky sessions disabled for better load distribution
    stickiness:
      enabled: false
      type: lb_cookie
```

### Weather-Based Predictive Scaling
```python
# Weather-Based Predictive Scaling
import boto3
import requests
from datetime import datetime, timedelta

class WeatherBasedScaling:
    def __init__(self):
        self.ecs_client = boto3.client('ecs')
        self.cloudwatch = boto3.client('cloudwatch')
        self.weather_api_key = os.environ['WEATHER_API_KEY']
    
    def check_severe_weather_forecast(self):
        """Check for severe weather that increases emergency calls"""
        uk_cities = [
            {'name': 'London', 'lat': 51.5074, 'lon': -0.1278},
            {'name': 'Manchester', 'lat': 53.4808, 'lon': -2.2426},
            {'name': 'Birmingham', 'lat': 52.4862, 'lon': -1.8904},
            {'name': 'Glasgow', 'lat': 55.8642, 'lon': -4.2518}
        ]
        
        severe_weather_detected = False
        
        for city in uk_cities:
            weather_data = self.get_weather_forecast(city['lat'], city['lon'])
            
            # Check for conditions that increase breakdown likelihood
            if self.is_severe_weather(weather_data):
                severe_weather_detected = True
                self.log_weather_alert(city['name'], weather_data)
        
        return severe_weather_detected
    
    def is_severe_weather(self, weather_data):
        """Determine if weather conditions will increase emergency calls"""
        conditions_that_increase_calls = [
            weather_data.get('temperature', 20) < 0,  # Freezing temperatures
            weather_data.get('rainfall', 0) > 10,     # Heavy rain
            weather_data.get('snowfall', 0) > 1,      # Any snow
            weather_data.get('wind_speed', 0) > 50,   # High winds
            'ice' in weather_data.get('description', '').lower(),
            'storm' in weather_data.get('description', '').lower()
        ]
        
        return any(conditions_that_increase_calls)
    
    def proactive_scale_up(self):
        """Proactively scale up before severe weather hits"""
        print("🌦️ Severe weather detected - scaling up emergency service")
        
        # Scale ECS service
        self.ecs_client.update_service(
            cluster='tyrehero-production',
            service='tyrehero-emergency-api',
            desiredCount=20  # 2.5x normal capacity
        )
        
        # Update auto-scaling targets
        application_autoscaling = boto3.client('application-autoscaling')
        application_autoscaling.register_scalable_target(
            ServiceNamespace='ecs',
            ResourceId='service/tyrehero-production/tyrehero-emergency-api',
            ScalableDimension='ecs:service:DesiredCount',
            MinCapacity=15,  # Higher minimum during weather events
            MaxCapacity=75   # Higher maximum capacity
        )
        
        # Send alerts
        self.send_weather_scaling_alert()
    
    def send_weather_scaling_alert(self):
        """Notify operations team of weather-based scaling"""
        sns = boto3.client('sns')
        sns.publish(
            TopicArn='arn:aws:sns:eu-west-2:123456789012:emergency-operations',
            Subject='🌦️ Weather-Based Emergency Service Scaling Activated',
            Message=f"""
            Severe weather conditions detected in UK regions.
            Emergency service has been proactively scaled up:
            
            - ECS Desired Count: 20 (from 8)
            - Auto-scaling Min: 15 (from 6)
            - Auto-scaling Max: 75 (from 50)
            
            Timestamp: {datetime.now().isoformat()}
            """
        )

# Lambda function for automated weather-based scaling
def lambda_handler(event, context):
    scaler = WeatherBasedScaling()
    
    if scaler.check_severe_weather_forecast():
        scaler.proactive_scale_up()
        return {'statusCode': 200, 'body': 'Scaled up for severe weather'}
    else:
        return {'statusCode': 200, 'body': 'No scaling needed'}
```

## 5. Application Performance Optimization

### Node.js Application Optimization
```javascript
// Emergency Service API - Performance Optimizations
const express = require('express');
const cluster = require('cluster');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const redis = require('redis');
const { Pool } = require('pg');

// Cluster configuration for multi-core utilization
if (cluster.isMaster) {
    const numCPUs = require('os').cpus().length;
    console.log(`🚀 Master process starting ${numCPUs} workers`);
    
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    const app = express();
    
    // Security middleware
    app.use(helmet({
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
    
    // Compression middleware
    app.use(compression({
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        },
        level: 6,
        threshold: 1024
    }));
    
    // Rate limiting with emergency bypass
    const createRateLimit = (windowMs, max) => rateLimit({
        windowMs,
        max,
        skip: (req, res) => {
            // Emergency requests bypass rate limiting
            return req.headers['x-emergency-priority'] === 'critical';
        },
        message: 'Too many requests, please try again later'
    });
    
    app.use('/api/emergency', createRateLimit(60000, 100)); // 100 per minute
    app.use('/api/', createRateLimit(60000, 1000)); // 1000 per minute for general API
    
    // Optimized database connection pool
    const dbPool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        
        // Connection pool optimization
        max: 50,                    // Maximum connections
        min: 10,                    // Minimum connections
        idleTimeoutMillis: 30000,   // 30 seconds
        connectionTimeoutMillis: 5000, // 5 seconds
        maxUses: 7500,              // Recycle connections
        
        // Performance settings
        statement_timeout: 30000,   // 30 seconds
        query_timeout: 25000,       // 25 seconds
        
        // Keep-alive settings
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000
    });
    
    // Redis connection with retry logic
    const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        
        // Performance optimization
        lazyConnect: true,
        keepAlive: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
        
        // Retry strategy
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3
    });
    
    // Emergency request handler with performance optimization
    app.post('/api/emergency', async (req, res) => {
        const startTime = process.hrtime.bigint();
        
        try {
            // Input validation (fast)
            const { customer_name, phone_number, location, issue } = req.body;
            
            if (!customer_name || !phone_number || !location || !issue) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            // Check for duplicate requests (Redis cache)
            const duplicateKey = `emergency:${phone_number}:${Date.now() - 300000}`; // 5 minutes
            const isDuplicate = await redisClient.get(duplicateKey);
            
            if (isDuplicate) {
                return res.status(409).json({ 
                    error: 'Duplicate request detected',
                    existing_request_id: isDuplicate 
                });
            }
            
            // Geocoding with cache
            const geocodeKey = `geocode:${location}`;
            let coordinates = await redisClient.get(geocodeKey);
            
            if (!coordinates) {
                coordinates = await geocodeLocation(location);
                await redisClient.setex(geocodeKey, 86400, JSON.stringify(coordinates)); // 24h cache
            } else {
                coordinates = JSON.parse(coordinates);
            }
            
            // Create emergency request (optimized query)
            const insertQuery = `
                INSERT INTO emergency_requests (
                    customer_name, phone_number, location_address, 
                    location_coordinates, postcode, vehicle_make_model, 
                    tyre_issue, priority_level
                ) VALUES ($1, $2, $3, ST_Point($4, $5), $6, $7, $8, $9)
                RETURNING id, created_at
            `;
            
            const priority = calculatePriority(req.body);
            const postcode = extractPostcode(location);
            
            const result = await dbPool.query(insertQuery, [
                customer_name,
                phone_number,
                location,
                coordinates.longitude,
                coordinates.latitude,
                postcode,
                req.body.vehicle_make_model || 'Unknown',
                issue,
                priority
            ]);
            
            const requestId = result.rows[0].id;
            
            // Cache for duplicate detection
            await redisClient.setex(duplicateKey, 300, requestId);
            
            // Trigger technician matching (async)
            setImmediate(() => matchTechnician(requestId, coordinates, priority));
            
            // Performance metrics
            const endTime = process.hrtime.bigint();
            const durationMs = Number(endTime - startTime) / 1000000;
            
            // Log performance
            console.log(`Emergency request processed in ${durationMs.toFixed(2)}ms`);
            
            res.status(201).json({
                id: requestId,
                status: 'received',
                estimated_response_time: calculateEstimatedResponse(coordinates),
                created_at: result.rows[0].created_at,
                performance: {
                    processing_time_ms: Math.round(durationMs)
                }
            });
            
        } catch (error) {
            console.error('Emergency request error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                request_id: req.headers['x-request-id']
            });
        }
    });
    
    // Health check endpoint with detailed metrics
    app.get('/health', async (req, res) => {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: false,
                cache: false,
                queue: false
            },
            metrics: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                active_connections: dbPool.totalCount,
                idle_connections: dbPool.idleCount
            }
        };
        
        try {
            // Database health check
            await dbPool.query('SELECT 1');
            health.checks.database = true;
            
            // Cache health check
            await redisClient.ping();
            health.checks.cache = true;
            
            // Queue health check
            const queueLength = await redisClient.llen('emergency_queue');
            health.checks.queue = queueLength < 20; // Healthy if queue < 20
            health.metrics.queue_length = queueLength;
            
            const allHealthy = Object.values(health.checks).every(check => check);
            
            res.status(allHealthy ? 200 : 503).json(health);
        } catch (error) {
            health.status = 'unhealthy';
            health.error = error.message;
            res.status(503).json(health);
        }
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Emergency service API running on port ${PORT} (Worker ${process.pid})`);
    });
}

// Performance monitoring middleware
function performanceMonitoring(req, res, next) {
    const startTime = process.hrtime.bigint();
    
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        // Log slow requests
        if (duration > 1000) { // Slower than 1 second
            console.warn(`Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
        }
        
        // Send metrics to CloudWatch
        if (process.env.NODE_ENV === 'production') {
            const AWS = require('aws-sdk');
            const cloudwatch = new AWS.CloudWatch();
            
            cloudwatch.putMetricData({
                Namespace: 'TyreHero/Emergency/API',
                MetricData: [{
                    MetricName: 'ResponseTime',
                    Value: duration,
                    Unit: 'Milliseconds',
                    Dimensions: [{
                        Name: 'Endpoint',
                        Value: req.path
                    }]
                }]
            }).promise().catch(console.error);
        }
    });
    
    next();
}
```

## 6. Monitoring & Performance Metrics

### Custom CloudWatch Metrics
```python
# Custom Performance Metrics Collection
import boto3
import time
import psutil
from datetime import datetime

class PerformanceMetrics:
    def __init__(self):
        self.cloudwatch = boto3.client('cloudwatch')
        self.namespace = 'TyreHero/Emergency/Performance'
    
    def send_custom_metrics(self):
        """Send custom performance metrics to CloudWatch"""
        metrics = []
        
        # Database performance metrics
        db_metrics = self.get_database_metrics()
        metrics.extend(db_metrics)
        
        # Cache performance metrics
        cache_metrics = self.get_cache_metrics()
        metrics.extend(cache_metrics)
        
        # Application performance metrics
        app_metrics = self.get_application_metrics()
        metrics.extend(app_metrics)
        
        # Business metrics
        business_metrics = self.get_business_metrics()
        metrics.extend(business_metrics)
        
        # Send to CloudWatch in batches
        for i in range(0, len(metrics), 20):  # CloudWatch limit is 20 metrics per request
            batch = metrics[i:i+20]
            self.cloudwatch.put_metric_data(
                Namespace=self.namespace,
                MetricData=batch
            )
    
    def get_database_metrics(self):
        """Collect database performance metrics"""
        import psycopg2
        
        conn = psycopg2.connect(
            host=os.environ['DB_HOST'],
            database=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD']
        )
        
        with conn.cursor() as cur:
            # Query performance
            cur.execute("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    max_time,
                    stddev_time
                FROM pg_stat_statements 
                WHERE query LIKE '%emergency_requests%'
                ORDER BY total_time DESC 
                LIMIT 10
            """)
            
            metrics = []
            for row in cur.fetchall():
                metrics.append({
                    'MetricName': 'DatabaseQueryTime',
                    'Value': row[3],  # mean_time
                    'Unit': 'Milliseconds',
                    'Timestamp': datetime.utcnow(),
                    'Dimensions': [
                        {'Name': 'QueryType', 'Value': 'emergency_requests'},
                        {'Name': 'Metric', 'Value': 'mean_time'}
                    ]
                })
            
            # Connection count
            cur.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
            active_connections = cur.fetchone()[0]
            
            metrics.append({
                'MetricName': 'DatabaseActiveConnections',
                'Value': active_connections,
                'Unit': 'Count',
                'Timestamp': datetime.utcnow()
            })
            
        conn.close()
        return metrics
    
    def get_cache_metrics(self):
        """Collect Redis cache performance metrics"""
        import redis
        
        r = redis.Redis(host=os.environ['REDIS_HOST'], port=6379, decode_responses=True)
        info = r.info()
        
        metrics = [
            {
                'MetricName': 'CacheHitRate',
                'Value': (info['keyspace_hits'] / (info['keyspace_hits'] + info['keyspace_misses'])) * 100,
                'Unit': 'Percent',
                'Timestamp': datetime.utcnow()
            },
            {
                'MetricName': 'CacheMemoryUsage',
                'Value': info['used_memory'],
                'Unit': 'Bytes',
                'Timestamp': datetime.utcnow()
            },
            {
                'MetricName': 'CacheConnectedClients',
                'Value': info['connected_clients'],
                'Unit': 'Count',
                'Timestamp': datetime.utcnow()
            }
        ]
        
        return metrics
    
    def get_business_metrics(self):
        """Collect business-specific performance metrics"""
        import psycopg2
        
        conn = psycopg2.connect(
            host=os.environ['DB_HOST'],
            database=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD']
        )
        
        with conn.cursor() as cur:
            # Emergency response time SLA
            cur.execute("""
                SELECT 
                    AVG(EXTRACT(EPOCH FROM (actual_arrival - created_at))/60) as avg_response_minutes,
                    COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (actual_arrival - created_at))/60 <= 90) * 100.0 / COUNT(*) as sla_compliance
                FROM emergency_requests 
                WHERE actual_arrival IS NOT NULL 
                AND created_at >= NOW() - INTERVAL '1 hour'
            """)
            
            result = cur.fetchone()
            if result and result[0]:
                avg_response = float(result[0])
                sla_compliance = float(result[1]) if result[1] else 0
                
                metrics = [
                    {
                        'MetricName': 'AverageResponseTime',
                        'Value': avg_response,
                        'Unit': 'None',
                        'Timestamp': datetime.utcnow()
                    },
                    {
                        'MetricName': 'SLACompliance',
                        'Value': sla_compliance,
                        'Unit': 'Percent',
                        'Timestamp': datetime.utcnow()
                    }
                ]
            else:
                metrics = []
            
            # Current queue length
            cur.execute("SELECT COUNT(*) FROM emergency_requests WHERE status = 'pending'")
            queue_length = cur.fetchone()[0]
            
            metrics.append({
                'MetricName': 'EmergencyQueueLength',
                'Value': queue_length,
                'Unit': 'Count',
                'Timestamp': datetime.utcnow()
            })
            
        conn.close()
        return metrics

# Lambda function to run performance metrics collection
def lambda_handler(event, context):
    metrics = PerformanceMetrics()
    metrics.send_custom_metrics()
    return {'statusCode': 200, 'body': 'Metrics sent successfully'}
```

This comprehensive performance optimization configuration ensures TyreHero's emergency service can handle high-volume traffic spikes while maintaining sub-second response times and meeting the 99.9% uptime SLA requirement.