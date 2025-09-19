# TyreHero Emergency Service - Production Server

A secure, high-performance Node.js server for 24/7 emergency mobile tyre services. Built with reliability, security, and emergency response requirements in mind.

## 🚨 Emergency Features

- **24/7 Emergency Booking System** - Handles urgent tyre emergencies with priority routing
- **Offline Support** - Progressive Web App with offline emergency call capabilities
- **Real-time Monitoring** - Health checks and emergency service availability monitoring
- **Rate Limiting** - Separate rate limits for emergency vs regular requests
- **Failover Support** - Graceful degradation with emergency contact fallbacks

## 📋 Quick Start

### Prerequisites

- Node.js 14+ and npm 6+
- PostgreSQL 12+ (or use Docker Compose)
- Redis (optional, for session storage)

### Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd tyrehero-emergency-service
chmod +x start.sh
./start.sh install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the service:**
```bash
./start.sh start
```

4. **Verify deployment:**
```bash
curl http://localhost:3000/health
./start.sh status
```

## 🐳 Docker Deployment

### Quick Deploy with Docker Compose

```bash
# Start all services (app, database, monitoring)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f tyrehero-app

# Scale the application
docker-compose up -d --scale tyrehero-app=3
```

### Production Docker Deployment

```bash
# Build production image
docker build -t tyrehero-emergency:latest .

# Run with environment variables
docker run -d \
  --name tyrehero-production \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  --restart=unless-stopped \
  tyrehero-emergency:latest
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `EMERGENCY_PHONE` | Yes | +447700900000 | Emergency contact number |
| `LOG_LEVEL` | No | info | Logging level |
| `CLUSTER_MODE` | No | false | Enable clustering |
| `REDIS_URL` | No | - | Redis connection for sessions |

### Security Configuration

```bash
# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For SESSION_SECRET

# SSL/TLS setup
mkdir -p nginx/ssl
# Add your SSL certificates to nginx/ssl/
```

## 🚀 API Endpoints

### Emergency Services

- `POST /api/emergency-booking` - Emergency tyre booking (priority handling)
- `POST /api/emergency-call` - Track emergency call attempts
- `GET /api/coverage-check` - Check service coverage area

### Regular Services

- `POST /api/regular-booking` - Standard tyre booking
- `POST /api/contact` - Contact form submission

### System

- `GET /health` - Health check endpoint
- `GET /manifest.json` - PWA manifest
- `GET /service-worker.js` - Service worker for offline support

## 🔒 Security Features

### Built-in Security

- **Helmet.js** - Security headers (CSP, HSTS, XSS protection)
- **Rate Limiting** - API and form submission limits
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Configured for production domains
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization and output encoding

### Emergency-Specific Security

- **Emergency Rate Limits** - Separate, higher limits for emergency endpoints
- **Failover Mechanisms** - Always provide emergency contact on errors
- **Offline Security** - Secure offline data storage and sync

## 📊 Monitoring & Analytics

### Health Monitoring

```bash
# Check service health
curl http://localhost:3000/health

# View real-time logs
./start.sh logs

# Monitor with Docker Compose stack
docker-compose logs -f grafana  # Access: http://localhost:3001
```

### Production Monitoring

- **Prometheus** - Metrics collection
- **Grafana** - Visualization dashboards
- **Loki** - Log aggregation
- **Custom Emergency Monitor** - Emergency service specific monitoring

## 🔧 Management Commands

### Service Management

```bash
./start.sh start     # Start the service
./start.sh stop      # Stop the service
./start.sh restart   # Restart the service
./start.sh status    # Show service status
./start.sh logs      # Show recent logs
./start.sh health    # Check health
```

### Development

```bash
npm run dev          # Development mode with auto-restart
npm run test         # Run test suite
npm run test:watch   # Watch mode testing
npm run lint         # Code quality check
npm run security     # Security audit
```

## 🏗️ Architecture

### Server Architecture

```
┌─────────────────┐
│   NGINX Proxy   │ ← SSL termination, static files, rate limiting
└─────────────────┘
         │
┌─────────────────┐
│  Node.js App    │ ← Express server with clustering support
└─────────────────┘
         │
┌─────────────────┐
│  PostgreSQL DB  │ ← Persistent data storage
└─────────────────┘
         │
┌─────────────────┐
│  Redis Cache    │ ← Session storage, caching
└─────────────────┘
```

### Emergency Flow

```
Emergency Request → Rate Limiter → Validator → Logger → Database → Notifications
                     ↓
              Offline Support ← Service Worker ← PWA Cache
```

## 📱 Progressive Web App

### Features

- **Offline Emergency Calls** - Cache emergency contact info
- **Push Notifications** - Emergency service updates
- **App-like Experience** - Installable on mobile devices
- **Background Sync** - Sync offline data when connected

### Service Worker Features

- **Critical Resource Caching** - Essential files always available
- **Emergency Offline Support** - Emergency booking even when offline
- **Smart Cache Strategy** - Network-first for APIs, cache-first for assets

## 🗄️ Database Schema

### Core Tables

- `emergency_bookings` - Emergency service requests
- `regular_bookings` - Standard bookings
- `contact_messages` - Customer inquiries
- `emergency_calls` - Emergency call tracking
- `technicians` - Service technician management
- `coverage_areas` - Service coverage mapping

### Analytics & Monitoring

- `analytics.page_views` - Website analytics
- `analytics.conversion_events` - Booking conversions
- `monitoring.health_checks` - System health tracking
- `monitoring.error_logs` - Error tracking and resolution

## 🚀 Deployment Strategies

### Development

```bash
NODE_ENV=development npm run dev
```

### Staging

```bash
NODE_ENV=staging ./start.sh start
```

### Production

```bash
# Single instance
NODE_ENV=production ./start.sh start

# Clustered mode
NODE_ENV=production CLUSTER_MODE=true ./start.sh start

# Docker production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Load Balanced Production

```bash
# Multiple app instances behind NGINX
docker-compose up -d --scale tyrehero-app=3
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

2. **Database Connection Issues**
```bash
# Check database connectivity
pg_isready -h localhost -p 5432
```

3. **Health Check Failures**
```bash
# Check service logs
./start.sh logs
# Check process status
./start.sh status
```

### Emergency Service Issues

- **Emergency Booking Failures** - Check rate limits and database connectivity
- **Offline Support Not Working** - Verify service worker registration
- **High Response Times** - Monitor database performance and connection pool

## 🧪 Testing

### Test Suite

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test -- --grep "Emergency"
npm test -- --grep "Security"
```

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

### Security Testing

```bash
# Security audit
npm audit

# Advanced security scanning
npm run security
```

## 📈 Performance Optimization

### Server Optimization

- **Clustering** - Multi-process support for high load
- **Connection Pooling** - Efficient database connections
- **Caching** - Redis-based session and data caching
- **Compression** - GZIP compression for responses

### Frontend Optimization

- **Asset Caching** - Long-term caching for static resources
- **Critical Path** - Prioritized loading for emergency features
- **Service Worker** - Intelligent caching strategies
- **PWA Features** - App-like performance

## 🔐 Security Checklist

### Production Security

- [ ] SSL/TLS certificates installed and configured
- [ ] Environment variables secured (no secrets in code)
- [ ] Database access restricted and encrypted
- [ ] Rate limiting configured appropriately
- [ ] Security headers implemented
- [ ] Input validation and sanitization active
- [ ] Error messages don't leak sensitive information
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured
- [ ] Security updates regularly applied

### Emergency-Specific Security

- [ ] Emergency endpoints always available
- [ ] Offline emergency features working
- [ ] Failover mechanisms tested
- [ ] Emergency contact information always accessible
- [ ] Emergency data properly secured and backed up

## 📞 Support & Emergency Contacts

### Emergency Service
- **Phone**: +447700900000 (24/7)
- **Emergency Booking**: Available through website and offline PWA

### Technical Support
- **System Health**: `curl http://your-domain.com/health`
- **Error Logs**: `./start.sh logs`
- **Status Check**: `./start.sh status`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/emergency-improvement`)
3. Commit your changes (`git commit -am 'Add emergency feature'`)
4. Push to the branch (`git push origin feature/emergency-improvement`)
5. Create a Pull Request

---

**Emergency Service Status**: 🟢 ONLINE
**Last Updated**: 2024-01-01
**Version**: 1.0.0